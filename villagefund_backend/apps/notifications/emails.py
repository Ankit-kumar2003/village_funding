import os
import requests
from django.conf import settings
from django.utils import timezone

def send_email_via_brevo_api(subject, html_content, text_content, to_email, to_name=None):
    """
    Sends an email using Brevo's SMTP REST API (HTTPS port 443).
    Bypasses the Render SMTP port blocks.
    """
    api_key = os.getenv('BREVO_API_KEY')
    if not api_key:
        print("[BREVO API ERROR] BREVO_API_KEY environment variable is not set!", flush=True)
        return False

    sender_email = settings.DEFAULT_FROM_EMAIL or 'rise2gatheradmin@gmail.com'
    sender_name = getattr(settings, 'VILLAGE_NAME', 'VillageFund') + " Support"

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
                "email": to_email,
                "name": to_name or to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content
    }

    try:
        print(f"[BREVO API] Sending email to {to_email} via HTTP API...", flush=True)
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code in [200, 201, 202]:
            print(f"[BREVO API SUCCESS] Email sent to {to_email}. Response: {response.json()}", flush=True)
            return True
        else:
            print(f"[BREVO API ERROR] Failed to send email. Status code: {response.status_code}, Response: {response.text}", flush=True)
            return False
    except Exception as e:
        print(f"[BREVO API ERROR] Exception occurred while sending email: {e}", flush=True)
        return False

def send_village_email(user, subject, text_message, html_content=None):
    """
    Base function to send an email using Brevo's HTTP API.
    """
    if not user.email:
        return False
    
    # Fallback to text as html if html_content is not supplied
    if not html_content:
        html_content = f"<p style='font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.5;'>{text_message.replace('\n', '<br>')}</p>"

    return send_email_via_brevo_api(
        subject=subject,
        html_content=html_content,
        text_content=text_message,
        to_email=user.email,
        to_name=user.full_name
    )

def send_contribution_received_email(user, contribution):
    """
    HTML email to the contributor confirming receipt of their payment/pledge contribution.
    """
    subject = f"⏳ Contribution Received | Pending Verification | VillageFund"
    
    submitted_date = contribution.submitted_at.astimezone().strftime('%d %b %Y, %I:%M %p') if contribution.submitted_at else timezone.now().strftime('%d %b %Y, %I:%M %p')
    ref_number = contribution.utr_number or contribution.cashfree_order_id or 'N/A'

    text_body = f"""
Dear {user.full_name},

We have received your contribution request of ₹{contribution.amount} for the campaign "{contribution.campaign.title}".

Your contribution is currently marked as PENDING. Our team will verify the payment (Reference: {ref_number}) shortly.
You will receive another email once it has been approved.

Thank you for supporting VillageFund!

Best regards,
The VillageFund Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#FF6B00;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">VillageFund</h1>
              <p style="margin:8px 0 0;color:#ffe0cc;font-size:14px;">Contribution Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333;margin:0 0 16px;">Dear <strong>{user.full_name}</strong>,</p>
              <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                Thank you for your contribution request. We have safely logged your details and placed it in verification.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F3;border:2px solid #FF6B00;border-radius:10px;margin:0 0 28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Contribution Amount</p>
                    <p style="margin:0 0 8px;font-size:32px;font-weight:bold;color:#FF6B00;">₹{contribution.amount}</p>
                    <span style="background:#FFE6D5;color:#D35400;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;">PENDING VERIFICATION</span>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;width:130px;">Campaign</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-weight:bold;">{contribution.campaign.title}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;">Payment Method</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">{contribution.payment_method}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;">Reference / UTR</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-family:monospace;">{ref_number}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-size:14px;color:#888;">Submitted At</td>
                  <td style="padding:10px 0;font-size:14px;color:#333;">{submitted_date}</td>
                </tr>
              </table>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
                Our team will verify the payment shortly. Once approved, you will receive an approval email and your name will appear on the leaderboard!
              </p>
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">Thank you for supporting VillageFund!</p>
            </td>
          </tr>
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
    return send_village_email(user, subject, text_body, html_body)

def send_contribution_status_email(user, contribution):
    """
    HTML email to the contributor notifying them whether their payment has been APPROVED or REJECTED.
    """
    status_text = "APPROVED" if contribution.status == "APPROVED" else "REJECTED"
    subject = f"Update on your contribution: {status_text} | VillageFund"
    
    ref_number = contribution.utr_number or contribution.cashfree_payment_id or contribution.cashfree_order_id or 'N/A'
    
    text_body = f"Dear {user.full_name},\n\nYour contribution of ₹{contribution.amount} for the campaign \"{contribution.campaign.title}\" has been {status_text}.\n\n"
    if contribution.status == "APPROVED":
        text_body += "Thank you for your generous support! Your contribution has been added to the total raised amount and you are now visible on the leaderboard."
    else:
        text_body += f"Unfortunately, we could not verify your transaction. Reason: {contribution.rejection_reason or 'No explanation provided'}.\nPlease double-check the UTR/Reference number and try again, or contact the treasurer for assistance."
    text_body += "\n\nBest regards,\nThe VillageFund Team"

    theme_color = "#1A6B3C" if contribution.status == "APPROVED" else "#C0392B"
    bg_light = "#F4FBF7" if contribution.status == "APPROVED" else "#FDEDEC"
    status_label = "APPROVED 🌟" if contribution.status == "APPROVED" else "REJECTED ⚠️"

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:{theme_color};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">VillageFund</h1>
              <p style="margin:8px 0 0;color:#e8f4ec;font-size:14px;">Contribution status update</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333;margin:0 0 16px;">Dear <strong>{user.full_name}</strong>,</p>
              <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
                Your contribution details have been processed. See the updated status below:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:{bg_light};border:2px solid {theme_color};border-radius:10px;margin:0 0 28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Contribution Amount</p>
                    <p style="margin:0 0 8px;font-size:32px;font-weight:bold;color:{theme_color};">₹{contribution.amount}</p>
                    <span style="background:{theme_color};color:#ffffff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;">{status_label}</span>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;width:130px;">Campaign</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-weight:bold;">{contribution.campaign.title}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;">Reference / UTR</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-family:monospace;">{ref_number}</td>
                </tr>
"""

    if contribution.status == "REJECTED":
        html_body += f"""
                <tr>
                  <td style="padding:10px 0;font-size:14px;color:#888;vertical-align:top;">Reason</td>
                  <td style="padding:10px 0;font-size:14px;color:#C0392B;font-weight:bold;line-height:1.5;">{contribution.rejection_reason or 'No rejection reason specified.'}</td>
                </tr>
"""

    html_body += f"""
              </table>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
"""

    if contribution.status == "APPROVED":
        html_body += "Thank you for your generous support! Your contribution has been added to the total raised amount and you are now visible on the leaderboard. Let's keep building a stronger village together!"
    else:
        html_body += "Unfortunately, we could not verify your transaction. Please double-check your payment reference or UTR, submit a new contribution record, or contact the treasurer for assistance."

    html_body += """
              </p>
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">Best regards, Team VillageFund</p>
            </td>
          </tr>
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
    return send_village_email(user, subject, text_body, html_body)

def send_admin_payment_alert_email(user, contribution):
    """
    HTML email to the admin notifying them that a manual payment (UPI/Bank) has been submitted.
    """
    admin_email = settings.DEFAULT_FROM_EMAIL or 'rise2gatheradmin@gmail.com'
    subject = f"🔔 Manual Payment Approval Required | UTR #{contribution.utr_number or 'N/A'}"
    
    submitted_date = contribution.submitted_at.astimezone().strftime('%d %b %Y, %I:%M %p') if contribution.submitted_at else timezone.now().strftime('%d %b %Y, %I:%M %p')

    text_body = f"""
New manual payment submitted for approval!

Contributor : {user.full_name} ({user.email or 'No email'})
Campaign    : {contribution.campaign.title}
Amount      : ₹{contribution.amount}
UTR Number  : {contribution.utr_number}
Submitted   : {submitted_date}

Please check the treasurer admin panel to verify and approve/reject this contribution.
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1A6B3C;padding:24px 40px;">
              <h2 style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">🔔 Manual Payment Pending</h2>
              <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px;">Treasurer Verification Required</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="font-size:15px;color:#333;margin:0 0 20px;line-height:1.5;">
                A new contribution has been submitted via offline method (UPI/Bank Transfer) and requires verification.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4FBF7;border:2px solid #1A6B3C;border-radius:10px;margin:0 0 24px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;">Contribution Amount</p>
                    <p style="margin:0;font-size:28px;font-weight:bold;color:#1A6B3C;">₹{contribution.amount}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 12px;font-size:13px;color:#888;width:120px;border-bottom:1px solid #eee;">Contributor</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;font-weight:bold;border-bottom:1px solid #eee;">{user.full_name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;font-size:13px;color:#888;border-bottom:1px solid #eee;">Campaign</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;border-bottom:1px solid #eee;">{contribution.campaign.title}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 12px;font-size:13px;color:#888;border-bottom:1px solid #eee;">UTR Number</td>
                  <td style="padding:10px 12px;font-size:14px;color:#C0392B;font-weight:bold;font-family:monospace;border-bottom:1px solid #eee;">{contribution.utr_number}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;font-size:13px;color:#888;border-bottom:1px solid #eee;">Payment Method</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;border-bottom:1px solid #eee;">{contribution.payment_method}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 12px;font-size:13px;color:#888;">Submitted At</td>
                  <td style="padding:10px 12px;font-size:14px;color:#222;">{submitted_date}</td>
                </tr>
              </table>
              <p style="font-size:14px;color:#555;line-height:1.5;margin:0 0 24px;">
                Please verify the transaction UTR reference with your bank statement or UPI app, and then approve or reject the contribution inside the Django admin panel.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 20px;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">VillageFund Admin Notification · Do not reply</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return send_email_via_brevo_api(
        subject=subject,
        html_content=html_body,
        text_content=text_body,
        to_email=admin_email
    )

def broadcast_new_campaign(campaign_id):
    from apps.users.models import User
    from apps.campaigns.models import Campaign
    from apps.notifications.models import Notification
    
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return
        
    active_users = User.objects.filter(is_active=True)
    
    subject = f"📢 New Campaign Launched: {campaign.title} | VillageFund"
    body = f"A new fundraising campaign has been launched: {campaign.title}.\n\nGoal Amount: ₹{campaign.goal_amount}\nCategory: {campaign.get_category_display()}\n\nVisit the portal to learn more and contribute!"
    
    html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#1A6B3C;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">New Campaign Launched</h1>
              <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px;">VillageFund Announcement</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#222;font-size:20px;">{campaign.title}</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
                We are excited to announce a new community campaign: <strong>{campaign.title}</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4FBF7;border:1px solid #1A6B3C;border-radius:10px;margin:0 0 24px;padding:20px;">
                <tr>
                  <td>
                    <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Goal Amount</span>
                    <p style="font-size:24px;font-weight:bold;color:#1A6B3C;margin:4px 0 0;">₹{campaign.goal_amount}</p>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Category</span>
                    <p style="font-size:16px;font-weight:bold;color:#222;margin:4px 0 0;">{campaign.get_category_display()}</p>
                  </td>
                </tr>
              </table>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
                {campaign.description[:250]}...
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">Thank you for helping us support our village!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    
    for user in active_users:
        # Create in-app notification
        Notification.objects.create(
            recipient=user,
            title=f"New Campaign: {campaign.title}",
            body=f"A new campaign '{campaign.title}' has been launched with a goal of ₹{campaign.goal_amount}.",
            type='NEW_CAMPAIGN',
            campaign=campaign
        )
        # Send email
        if user.email:
            send_email_via_brevo_api(subject, html_body, body, user.email, user.full_name)


def broadcast_campaign_date_extended(campaign_id, old_date_str, new_date_str):
    from apps.users.models import User
    from apps.campaigns.models import Campaign
    from apps.notifications.models import Notification
    
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return
        
    active_users = User.objects.filter(is_active=True)
    
    subject = f"📅 Deadline Extended: {campaign.title} | VillageFund"
    body = f"The deadline for the campaign '{campaign.title}' has been extended from {old_date_str} to {new_date_str}.\n\nThere is still time to support this cause. Visit the portal to view progress or contribute!"
    
    html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#FF6B00;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">Deadline Extended</h1>
              <p style="margin:8px 0 0;color:#ffe0cc;font-size:14px;">Campaign Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#222;font-size:18px;">{campaign.title}</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
                Good news! To give everyone a chance to participate and meet our community goals, the deadline for the campaign <strong>{campaign.title}</strong> has been extended.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F3;border:1px solid #FF6B00;border-radius:10px;margin:0 0 24px;padding:20px;text-align:center;">
                <tr>
                  <td>
                    <span style="font-size:11px;color:#888;text-transform:uppercase;">Original Deadline</span>
                    <p style="font-size:16px;text-decoration:line-through;color:#c0392b;margin:4px 0 0;">{old_date_str}</p>
                  </td>
                  <td style="font-size:20px;color:#FF6B00;font-weight:bold;">➔</td>
                  <td>
                    <span style="font-size:11px;color:#888;text-transform:uppercase;font-weight:bold;">New Deadline</span>
                    <p style="font-size:18px;font-weight:bold;color:#1A6B3C;margin:4px 0 0;">{new_date_str}</p>
                  </td>
                </tr>
              </table>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
                Visit the platform to view the current progress or make a contribution.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">Thank you for your continuous support!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    
    for user in active_users:
        Notification.objects.create(
            recipient=user,
            title=f"Deadline Extended: {campaign.title}",
            body=f"The deadline for '{campaign.title}' has been extended to {new_date_str}.",
            type='PLEDGE_DUE',
            campaign=campaign
        )
        if user.email:
            send_email_via_brevo_api(subject, html_body, body, user.email, user.full_name)


def broadcast_expense_posted(expense_id):
    from apps.users.models import User
    from apps.expenses.models import Expense
    from apps.notifications.models import Notification
    
    try:
        expense = Expense.objects.select_related('campaign').get(id=expense_id)
    except Expense.DoesNotExist:
        return
        
    campaign = expense.campaign
    active_users = User.objects.filter(is_active=True)
    
    subject = f"💸 New Expense Approved: {expense.description[:30]} | {campaign.title}"
    body = f"An expense of ₹{expense.amount} has been approved and posted for the campaign '{campaign.title}'.\n\nDescription: {expense.description}\nCategory: {expense.category}\n\nWe maintain 100% transparency in all village fund expenditures. Visit the Transparency dashboard to view receipts and invoice details."
    
    html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#C0392B;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">Expense Disbursed</h1>
              <p style="margin:8px 0 0;color:#f9d5d5;font-size:14px;">Transparency Update</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#222;font-size:18px;">{campaign.title}</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
                An expense has been approved and successfully posted under the campaign <strong>{campaign.title}</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDEDEC;border:1px solid #C0392B;border-radius:10px;margin:0 0 24px;padding:20px;">
                <tr>
                  <td>
                    <span style="font-size:11px;color:#888;text-transform:uppercase;">Expense Amount</span>
                    <p style="font-size:24px;font-weight:bold;color:#C0392B;margin:4px 0 0;">₹{expense.amount}</p>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#888;text-transform:uppercase;">Category</span>
                    <p style="font-size:16px;font-weight:bold;color:#222;margin:4px 0 0;">{expense.category}</p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#888;width:130px;">Description</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;font-weight:bold;">{expense.description}</td>
                </tr>
              </table>
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 24px;">
                To view the receipt, bills, and approval signatures, head to the Transparency section on our portal.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">VillageFund - 100% Transparent Community Funding</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    
    for user in active_users:
        Notification.objects.create(
            recipient=user,
            title=f"Expense Posted: {expense.description[:40]}",
            body=f"An expense of ₹{expense.amount} was posted for '{campaign.title}'.",
            type='EXPENSE_POSTED',
            campaign=campaign
        )
        if user.email:
            send_email_via_brevo_api(subject, html_body, body, user.email, user.full_name)


def broadcast_campaign_update(campaign_update_id):
    from apps.users.models import User
    from apps.campaigns.models import CampaignUpdate
    from apps.notifications.models import Notification
    
    try:
        update = CampaignUpdate.objects.select_related('campaign').get(id=campaign_update_id)
    except CampaignUpdate.DoesNotExist:
        return
        
    campaign = update.campaign
    active_users = User.objects.filter(is_active=True)
    
    subject = f"📝 Campaign Update: {update.title} | {campaign.title}"
    body = f"A new update has been posted for the campaign '{campaign.title}': {update.title}\n\n{update.body}\n\nVisit the portal to see the full details and progress."
    
    html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#1A6B3C;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">Campaign Update</h1>
              <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px;">{campaign.title}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#222;font-size:18px;">{update.title}</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;white-space:pre-wrap;">
{update.body}
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">Thank you for following along with our community achievements!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    
    for user in active_users:
        Notification.objects.create(
            recipient=user,
            title=f"Campaign Update: {update.title[:40]}",
            body=f"An update '{update.title}' was posted for '{campaign.title}'.",
            type='NEW_CAMPAIGN',
            campaign=campaign
        )
        if user.email:
            send_email_via_brevo_api(subject, html_body, body, user.email, user.full_name)


def broadcast_campaign_reminder(campaign_id, reminder_title, reminder_body):
    from apps.users.models import User
    from apps.campaigns.models import Campaign
    from apps.notifications.models import Notification
    
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return
        
    active_users = User.objects.filter(is_active=True)
    
    subject = f"🔔 Reminder: {reminder_title} | {campaign.title}"
    body = f"{reminder_body}\n\nVisit the portal to support '{campaign.title}' and help us reach the community goal."
    
    html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 20px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#FF6B00;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;">Community Reminder</h1>
              <p style="margin:8px 0 0;color:#ffe0cc;font-size:14px;">{campaign.title}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#222;font-size:18px;">{reminder_title}</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;white-space:pre-wrap;">
{reminder_body}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F3;border-radius:10px;margin:0 0 24px;padding:20px;border:1px solid #FF6B00;">
                <tr>
                  <td>
                    <span style="font-size:11px;color:#888;text-transform:uppercase;">Goal</span>
                    <p style="font-size:18px;font-weight:bold;color:#222;margin:4px 0 0;">₹{campaign.goal_amount}</p>
                  </td>
                  <td>
                    <span style="font-size:11px;color:#888;text-transform:uppercase;">Raised So Far</span>
                    <p style="font-size:18px;font-weight:bold;color:#1A6B3C;margin:4px 0 0;">₹{campaign.raised_amount}</p>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
              <p style="font-size:13px;color:#aaa;margin:0;">Thank you for your generous participation in our village projects!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    
    for user in active_users:
        Notification.objects.create(
            recipient=user,
            title=reminder_title,
            body=reminder_body[:120] + "..." if len(reminder_body) > 120 else reminder_body,
            type='PLEDGE_DUE',
            campaign=campaign
        )
        if user.email:
            send_email_via_brevo_api(subject, html_body, body, user.email, user.full_name)

