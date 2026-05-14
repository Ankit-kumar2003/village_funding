import uuid
from django.db import models
from apps.users.models import User
from apps.campaigns.models import Campaign

class Expense(models.Model):
    APPROVAL_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='expenses')
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    receipt_image = models.ImageField(upload_to='expenses/receipts/', null=True, blank=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='approved_expenses')
    requires_multi_sig = models.BooleanField(default=False)
    approval_count = models.IntegerField(default=0)

class ExpenseApproval(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='approvals')
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE)
    approved_at = models.DateTimeField(auto_now_add=True)

class ExpenseFlag(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='flags')
    flagged_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    resolution_note = models.TextField(null=True, blank=True)
