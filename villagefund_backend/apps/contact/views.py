from rest_framework import viewsets, permissions
from apps.contact.models import ContactMessage
from apps.contact.serializers import ContactMessageSerializer
from apps.users.permissions import IsSuperAdmin
from django.core.mail import send_mail
from django.conf import settings
import threading

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-submitted_at')
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSuperAdmin]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        msg = serializer.save()
        # Send admin notification email asynchronously
        threading.Thread(target=self.send_admin_email, args=(msg,)).start()

    def send_admin_email(self, msg):
        subject = f"[VillageFund] New Contact Inquiry: {msg.get_category_display()}"
        body = f"""
New contact message received on VillageFund!

Name: {msg.name}
Phone: {msg.phone_number}
Email: {msg.email or 'N/A'}
Category: {msg.get_category_display()}

Message:
{msg.message}

Please log in to the admin panel to review and resolve this query.
"""
        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@villagefund.org',
                recipient_list=[settings.DEFAULT_FROM_EMAIL or 'admin@villagefund.org'],
                fail_silently=True
            )
        except Exception:
            # Safe catch to prevent request crashing
            pass
