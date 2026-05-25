from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from django.db.models import Sum
from django.db import transaction
from apps.campaigns.models import Campaign
from apps.contributions.models import Contribution
from apps.expenses.models import Expense
from apps.users.permissions import IsSuperAdmin
from .models import VillageReserve, ReserveLedgerEntry, AuditLog
from .serializers import VillageReserveSerializer, ReserveLedgerEntrySerializer, AuditLogSerializer

class StatsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_raised = Contribution.objects.filter(status='APPROVED').aggregate(total=Sum('amount'))['total'] or 0
        total_spent = Expense.objects.filter(approval_status='APPROVED').aggregate(total=Sum('amount'))['total'] or 0
        reserve = VillageReserve.objects.first()
        reserve_balance = reserve.balance if reserve else 0
        campaigns_completed = Campaign.objects.filter(status='COMPLETED').count()
        active_contributors = Contribution.objects.filter(status='APPROVED').values('contributor').distinct().count()
        campaigns_active = Campaign.objects.filter(status='ACTIVE').count()
        
        # Calculate transparency rate/health score
        total_expenses = Expense.objects.filter(approval_status='APPROVED').count()
        expenses_with_receipts = Expense.objects.filter(approval_status='APPROVED', receipt_image__gt='').count()
        transparency_score = int((expenses_with_receipts / total_expenses * 100)) if total_expenses > 0 else 100
        
        health_score = int((transparency_score * 0.5) + 50)

        return Response({
            'total_raised': float(total_raised),
            'total_spent': float(total_spent),
            'reserve_balance': float(reserve_balance),
            'campaigns_completed': campaigns_completed,
            'campaigns_active': campaigns_active,
            'active_contributors': active_contributors,
            'health_score': health_score
        })

class ReserveViewSet(viewsets.ModelViewSet):
    queryset = ReserveLedgerEntry.objects.all().order_by('-posted_at')
    serializer_class = ReserveLedgerEntrySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        with transaction.atomic():
            entry = serializer.save(posted_by=self.request.user)
            reserve, created = VillageReserve.objects.get_or_create(id=1)
            if entry.entry_type == 'CREDIT':
                reserve.balance += entry.amount
            else:
                reserve.balance -= entry.amount
            reserve.save()
            
            # Log action to AuditLog
            AuditLog.objects.create(
                actor=self.request.user,
                action=f"POSTED_RESERVE_{entry.entry_type}",
                target_model="ReserveLedgerEntry",
                target_id=str(entry.id),
                meta={"amount": float(entry.amount), "reason": entry.reason}
            )

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]
