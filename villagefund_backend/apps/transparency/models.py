import uuid
from django.db import models
from apps.users.models import User
from apps.campaigns.models import Campaign

class VillageReserve(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)
    description = models.TextField(null=True, blank=True)

class ReserveLedgerEntry(models.Model):
    ENTRY_CHOICES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    entry_type = models.CharField(max_length=20, choices=ENTRY_CHOICES)
    reason = models.CharField(max_length=255)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, null=True, blank=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(auto_now_add=True)

class TreasurerDeclaration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    treasurer = models.ForeignKey(User, on_delete=models.CASCADE)
    declaration_text = models.TextField()
    signed_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    meta = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
