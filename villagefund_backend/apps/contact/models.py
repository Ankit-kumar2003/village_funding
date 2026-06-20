import uuid
from django.db import models
from django.utils import timezone


def generate_ticket_number():
    """Auto-generate ticket ID like VF-2025-00001"""
    year = timezone.now().year
    # Count existing messages this year and add 1
    count = ContactMessage.objects.filter(submitted_at__year=year).count() + 1
    return f"VF-{year}-{count:05d}"


class ContactMessage(models.Model):
    CATEGORY_CHOICES = (
        ('GENERAL', 'General Query'),
        ('ISSUE', 'Report Issue'),
        ('SUGGEST_CAMPAIGN', 'Suggest Campaign'),
        ('TECHNICAL', 'Technical Problem'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=25, unique=True, blank=True)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Automatically update resolved_at timestamp based on resolution status
        if self.is_resolved and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif not self.is_resolved:
            self.resolved_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number} | {self.name} | {self.get_category_display()}"

    class Meta:
        ordering = ['-submitted_at']


