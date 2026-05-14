import uuid
from django.db import models
from apps.users.models import User
from apps.campaigns.models import Campaign

class Notification(models.Model):
    TYPE_CHOICES = (
        ('CONTRIBUTION_APPROVED', 'Contribution Approved'),
        ('NEW_CAMPAIGN', 'New Campaign'),
        ('EXPENSE_POSTED', 'Expense Posted'),
        ('PLEDGE_DUE', 'Pledge Due'),
        ('BADGE_EARNED', 'Badge Earned'),
        ('FLAG_RAISED', 'Flag Raised'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    body = models.CharField(max_length=500)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
