from rest_framework import viewsets, permissions
from apps.contact.models import ContactMessage, generate_ticket_number
from apps.contact.serializers import ContactMessageSerializer
from apps.users.permissions import IsSuperAdmin
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
import threading
import logging

logger = logging.getLogger(__name__)



def send_user_confirmation_email(msg):
    """HTML confirmation email to the user with their ticket number."""
    if not msg.email:
        return  # No email provided — skip silently

    subject = f"✅ We received your message | Ticket #{msg.ticket_number} | VillageFund"

    text_body = f"""
Hi {msg.name},

Thank you for contacting VillageFund!

Your support ticket has been created:

  Ticket Number : {msg.ticket_number}
  Category      : {msg.get_category_display()}
  Submitted     : {msg.submitted_at.strftime('%d %b %Y, %I:%M %p')} IST

Your message:
"{msg.message}"

We will review your query and respond within 24–48 hours.
Please keep your ticket number handy for any follow-up.

– Team VillageFund
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#FF6B00;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">VillageFund</h1>
              <p style="margin:8px 0 0;color:#ffe0cc;font-size:14px;">Empowering Villages, Together</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333;margin:0 0 16px;">Hi <strong>{msg.name}</strong>,</p>
              <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                Thank you for reaching out to us. We have received your message and created a support ticket for you.
              </p>

              <!-- Ticket Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F3;border:2px solid #FF6B00;border-radius:10px;margin:0 0 28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Ticket Number</p>
                    <p style="margin:0;font-size:28px;font-weight:bold;color:#FF6B00;letter-spacing:2px;">{msg.ticket_number}</p>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;width:130px;">Category</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-weight:bold;">{msg.get_category_display()}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;">Submitted</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">{msg.submitted_at.strftime('%d %b %Y, %I:%M %p')} IST</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-size:14px;color:#888;vertical-align:top;">Your Message</td>
                  <td style="padding:10px 0;font-size:14px;color:#333;font-style:italic;">"{msg.message[:200]}{'...' if len(msg.message) > 200 else ''}"</td>
                </tr>
              </table>

              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">
                ⏱️ We typically respond within <strong>24–48 hours</strong>.
              </p>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
                Please keep your ticket number <strong>{msg.ticket_number}</strong> handy for any follow-up.
              </p>

              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">
                This is an automated message from VillageFund. Please do not reply to this email directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaa;">© 2025 VillageFund · Built for Mahuaa Village</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    print(f"[DEBUG EMAIL] User Confirmation Email Attempt:\n  Host: {settings.EMAIL_HOST}\n  Port: {settings.EMAIL_PORT}\n  User: {settings.EMAIL_HOST_USER}\n  From: {settings.DEFAULT_FROM_EMAIL}\n  To: {msg.email}", flush=True)
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@villagefund.org',
            to=[msg.email],
        )
        email.attach_alternative(html_body, "text/html")
        email.send(fail_silently=False)
        print(f"[DEBUG EMAIL] User Confirmation Email sent successfully to {msg.email}", flush=True)
    except Exception as e:
        import traceback
        print(f"[DEBUG EMAIL ERROR] Failed to send user email to {msg.email}: {e}", flush=True)
        traceback.print_exc()





def send_admin_notification_email(msg):
    """Plain notification email to admin with all message details."""
    admin_email = settings.DEFAULT_FROM_EMAIL or 'admin@villagefund.org'

    subject = f"🔔 New Contact Message | Ticket #{msg.ticket_number} | {msg.get_category_display()}"

    text_body = f"""
New contact message received on VillageFund!

Ticket #  : {msg.ticket_number}
Name      : {msg.name}
Phone     : {msg.phone_number}
Email     : {msg.email or 'Not provided'}
Category  : {msg.get_category_display()}
Submitted : {msg.submitted_at.strftime('%d %b %Y, %I:%M %p')} IST

Message:
{msg.message}

---
Log in to the admin panel to view and resolve this ticket.
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#1A6B3C;padding:24px 40px;">
              <h2 style="margin:0;color:#fff;font-size:18px;">🔔 New Contact Message Received</h2>
              <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px;">VillageFund Admin Notification</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <!-- Ticket badge -->
              <p style="margin:0 0 20px;font-size:13px;color:#888;">
                Ticket Number: <strong style="font-size:18px;color:#FF6B00;">{msg.ticket_number}</strong>
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 12px;font-size:13px;color:#888;width:110px;border-bottom:1px solid #eee;">Name</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;font-weight:bold;border-bottom:1px solid #eee;">{msg.name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;font-size:13px;color:#888;border-bottom:1px solid #eee;">Phone</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;border-bottom:1px solid #eee;">{msg.phone_number}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 12px;font-size:13px;color:#888;border-bottom:1px solid #eee;">Email</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;border-bottom:1px solid #eee;">{msg.email or '—'}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;font-size:13px;color:#888;border-bottom:1px solid #eee;">Category</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;border-bottom:1px solid #eee;">{msg.get_category_display()}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 12px;font-size:13px;color:#888;">Submitted</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;">{msg.submitted_at.strftime('%d %b %Y, %I:%M %p')} IST</td>
                </tr>
              </table>

              <p style="font-size:13px;color:#888;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
              <div style="background:#f9f9f9;border-left:4px solid #FF6B00;padding:16px;border-radius:0 8px 8px 0;font-size:14px;color:#333;line-height:1.7;">
                {msg.message}
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;">VillageFund Admin Notification · Do not reply</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    print(f"[DEBUG EMAIL] Admin Notification Email Attempt:\n  Host: {settings.EMAIL_HOST}\n  Port: {settings.EMAIL_PORT}\n  User: {settings.EMAIL_HOST_USER}\n  From: {settings.DEFAULT_FROM_EMAIL}\n  To: {admin_email}", flush=True)
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL or 'noreply@villagefund.org',
            to=[admin_email],
        )
        email.attach_alternative(html_body, "text/html")
        email.send(fail_silently=False)
        print(f"[DEBUG EMAIL] Admin Notification Email sent successfully to {admin_email}", flush=True)
    except Exception as e:
        import traceback
        print(f"[DEBUG EMAIL ERROR] Failed to send admin email to {admin_email}: {e}", flush=True)
        traceback.print_exc()





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
        # Generate unique ticket number
        ticket = generate_ticket_number()
        msg = serializer.save(ticket_number=ticket)
        print(f"[DEBUG EMAIL] perform_create saved message. Ticket: {ticket}. Spawning email threads...", flush=True)

        # Fire both emails in background threads (non-blocking)
        threading.Thread(target=send_user_confirmation_email, args=(msg,), daemon=True).start()
        threading.Thread(target=send_admin_notification_email, args=(msg,), daemon=True).start()

