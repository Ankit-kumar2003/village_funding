from django.core.mail import send_mail
from django.conf import settings

def send_village_email(user, subject, message):
    """
    Base function to send an email if the user has an email address attached.
    """
    if not user.email:
        return False
        
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,  # Don't crash the request if email fails (e.g. invalid credentials)
        )
        return True
    except Exception as e:
        print(f"Failed to send email to {user.email}: {e}")
        return False

def send_contribution_received_email(user, contribution):
    subject = f"Thank you for your contribution to {contribution.campaign.title}!"
    message = f"""
Dear {user.full_name},

We have received your contribution request of ₹{contribution.amount} for the campaign "{contribution.campaign.title}".

Your contribution is currently marked as PENDING. Our treasurer will verify the UTR/Reference number ({contribution.reference_number}) shortly.
You will receive another email once it has been approved.

Thank you for supporting VillageFund!

Best regards,
The VillageFund Team
"""
    return send_village_email(user, subject, message)

def send_contribution_status_email(user, contribution):
    status_text = "APPROVED" if contribution.status == "APPROVED" else "REJECTED"
    
    subject = f"Update on your contribution: {status_text}"
    
    message = f"""
Dear {user.full_name},

Your contribution of ₹{contribution.amount} for the campaign "{contribution.campaign.title}" has been {status_text}.

"""
    if contribution.status == "APPROVED":
        message += "Thank you for your generous support! Your contribution has been added to the total raised amount and you are now visible on the leaderboard."
    else:
        message += "Unfortunately, we could not verify your transaction. Please double-check the UTR/Reference number and try again, or contact the treasurer for assistance."

    message += """

Best regards,
The VillageFund Team
"""
    return send_village_email(user, subject, message)
