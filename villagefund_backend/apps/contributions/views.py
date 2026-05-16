from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Contribution, Pledge
from .serializers import ContributionSerializer, PledgeSerializer
from apps.users.permissions import IsTreasurer, IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from apps.notifications.emails import send_contribution_received_email, send_contribution_status_email
import threading

class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all().order_by('-submitted_at')
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'status']

    def get_queryset(self):
        # Users can only see their own contributions unless they are Treasurer/SuperAdmin
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'TREASURER']:
            return self.queryset
        return self.queryset.filter(contributor=user)

    def perform_create(self, serializer):
        contribution = serializer.save(contributor=self.request.user)
        # Send confirmation email asynchronously
        threading.Thread(target=send_contribution_received_email, args=(self.request.user, contribution)).start()

    @action(detail=True, methods=['post'], permission_classes=[IsTreasurer])
    def approve(self, request, pk=None):
        contribution = self.get_object()
        if contribution.status == 'PENDING':
            contribution.status = 'APPROVED'
            contribution.approved_by = request.user
            contribution.save()
            # Update Campaign raised_amount
            campaign = contribution.campaign
            campaign.raised_amount += contribution.amount
            campaign.save()
            
            # Send approval email
            threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
            
            return Response({'status': 'Approved', 'amount': contribution.amount})
        return Response({'error': 'Cannot approve. Status is not PENDING'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsTreasurer])
    def reject(self, request, pk=None):
        contribution = self.get_object()
        if contribution.status == 'PENDING':
            contribution.status = 'REJECTED'
            contribution.save()
            
            # Send rejection email
            threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
            
            return Response({'status': 'Rejected'})
        return Response({'error': 'Cannot reject. Status is not PENDING'}, status=status.HTTP_400_BAD_REQUEST)
