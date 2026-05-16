import uuid
from django.db import models
from apps.users.models import User
from apps.campaigns.models import Campaign

class Pledge(models.Model):
    FREQUENCY_CHOICES = (
        ('MONTHLY', 'Monthly'),
        ('WEEKLY', 'Weekly'),
    )
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='pledges')
    contributor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pledges')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    installment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    installment_count = models.IntegerField()
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    next_due_date = models.DateField()
    installments_paid = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

class Contribution(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='contributions')
    contributor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    utr_number = models.CharField(max_length=50, null=True, blank=True) # Making it optional for legacy
    instamojo_payment_request_id = models.CharField(max_length=100, null=True, blank=True)
    instamojo_payment_id = models.CharField(max_length=100, null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='INSTAMOJO')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    submitted_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='approved_contributions')
    rejection_reason = models.TextField(null=True, blank=True)
    pledge_id = models.ForeignKey(Pledge, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.CharField(max_length=255, null=True, blank=True)
