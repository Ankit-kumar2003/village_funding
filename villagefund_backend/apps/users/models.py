import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('SUPER_ADMIN', 'Super Admin'),
        ('TREASURER', 'Treasurer'),
        ('CONTRIBUTOR', 'Contributor'),
        ('VIEWER', 'Viewer'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CONTRIBUTOR')
    is_nri = models.BooleanField(default=False)
    village_name = models.CharField(max_length=255, default='Sundarpur')
    google_id = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.full_name or self.username

class ContributionStreak(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_contributed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.full_name} - Streak: {self.current_streak}"
