import uuid
from django.db import models
from apps.users.models import User

class Campaign(models.Model):
    CATEGORY_CHOICES = (
        ('RELIGIOUS', 'Religious'),
        ('INFRASTRUCTURE', 'Infrastructure'),
        ('SOCIAL', 'Social'),
        ('CULTURAL', 'Cultural'),
        ('EDUCATION', 'Education'),
        ('HEALTH', 'Health'),
    )
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('VOTING', 'Voting'),
        ('ACTIVE', 'Active'),
        ('FUNDED', 'Funded'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('ARCHIVED', 'Archived'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    start_date = models.DateField()
    end_date = models.DateField()
    cover_image = models.ImageField(upload_to='campaigns/covers/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_campaigns')
    treasurer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_campaigns')
    campaign_upi_id = models.CharField(max_length=255, null=True, blank=True)
    campaign_qr_image = models.ImageField(upload_to='campaigns/qrs/', null=True, blank=True)
    requires_voting = models.BooleanField(default=False)
    voting_threshold = models.IntegerField(default=60)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CampaignMilestone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField()
    is_unlocked = models.BooleanField(default=False)
    proof_photo = models.ImageField(upload_to='campaigns/milestones/', null=True, blank=True)
    unlocked_at = models.DateTimeField(null=True, blank=True)

class CampaignBudgetItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='budget_items')
    label = models.CharField(max_length=255)
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2)

class CampaignUpdate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='updates')
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    body = models.TextField()
    photo = models.ImageField(upload_to='campaigns/updates/', null=True, blank=True)
    video_url = models.URLField(max_length=500, null=True, blank=True)
    posted_at = models.DateTimeField(auto_now_add=True)

class CampaignVote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='votes')
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    vote = models.BooleanField()
    voted_at = models.DateTimeField(auto_now_add=True)

class CampaignComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    posted_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)

class Sponsorship(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='sponsorships')
    sponsor_name = models.CharField(max_length=255)
    sponsor_logo = models.ImageField(upload_to='sponsors/', null=True, blank=True)
    sponsor_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_cash = models.BooleanField(default=True)
    in_kind_description = models.TextField(null=True, blank=True)
    in_kind_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
