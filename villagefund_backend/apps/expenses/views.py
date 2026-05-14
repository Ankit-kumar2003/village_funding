from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from .models import Expense, ExpenseApproval
from .serializers import ExpenseSerializer
from apps.users.permissions import IsTreasurer, IsSuperAdmin
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-posted_at')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'approval_status']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'approve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        amount = serializer.validated_data.get('amount')
        is_multi_sig = amount > getattr(settings, 'MULTI_SIG_THRESHOLD', 2000)
        
        status_val = 'PENDING' if is_multi_sig else 'APPROVED'
        
        serializer.save(
            posted_by=self.request.user,
            requires_multi_sig=is_multi_sig,
            approval_status=status_val
        )

    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def approve(self, request, pk=None):
        expense = self.get_object()
        
        if expense.approval_status != 'PENDING':
            return Response({'error': 'Expense is not pending approval'}, status=status.HTTP_400_BAD_REQUEST)
            
        approval, created = ExpenseApproval.objects.get_or_create(
            expense=expense,
            approved_by=request.user
        )
        
        if created:
            expense.approval_count += 1
            
        # Check threshold
        if expense.approval_count >= getattr(settings, 'MULTI_SIG_REQUIRED_APPROVALS', 2):
            expense.approval_status = 'APPROVED'
            expense.approved_by = request.user
            
        expense.save()
            
        return Response({'status': 'Approval recorded', 'total_approvals': expense.approval_count})
