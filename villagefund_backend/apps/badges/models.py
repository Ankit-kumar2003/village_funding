import uuid
from django.db import models
from apps.users.models import User
from apps.campaigns.models import Campaign

class Badge(models.Model):
    CRITERIA_CHOICES = (
        ('FIRST_DONOR', 'First Donor'),
        ('TOP_3', 'Top 3'),
        ('CAMPAIGN_COUNT', 'Campaign Count'),
        ('AMOUNT_THRESHOLD', 'Amount Threshold'),
        ('STREAK', 'Streak'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    icon_url = models.CharField(max_length=500)
    criteria_type = models.CharField(max_length=50, choices=CRITERIA_CHOICES)
    criteria_value = models.IntegerField()

class UserBadge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, null=True, blank=True)
    awarded_at = models.DateTimeField(auto_now_add=True)
