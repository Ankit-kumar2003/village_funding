import uuid
from django.db import models
from apps.users.models import User
from apps.campaigns.models import Campaign

class GalleryPhoto(models.Model):
    CATEGORY_CHOICES = (
        ('BEFORE', 'Before'),
        ('DURING', 'During'),
        ('AFTER', 'After'),
        ('EVENT', 'Event'),
        ('GENERAL', 'General'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, null=True, blank=True, related_name='photos')
    photo = models.ImageField(upload_to='gallery/')
    caption = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)
    video_url = models.CharField(max_length=500, null=True, blank=True)
