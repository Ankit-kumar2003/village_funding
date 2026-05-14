import uuid
from django.db import models

class ContactMessage(models.Model):
    CATEGORY_CHOICES = (
        ('GENERAL', 'General Query'),
        ('ISSUE', 'Report Issue'),
        ('SUGGEST_CAMPAIGN', 'Suggest Campaign'),
        ('TECHNICAL', 'Technical Problem'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
