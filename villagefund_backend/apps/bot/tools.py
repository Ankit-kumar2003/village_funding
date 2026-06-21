from apps.campaigns.models import Campaign
from apps.expenses.models import Expense
from apps.transparency.models import VillageReserve, ReserveLedgerEntry

def get_campaigns_list() -> str:
    """
    Returns a string summarizing all campaigns on the platform (active, funded, completed, cancelled)
    with their categories, goal amount, raised amount, and current status.
    """
    try:
        campaigns = Campaign.objects.all().order_by('-created_at')
        if not campaigns.exists():
            return "No campaigns found on the platform."
        
        lines = []
        for c in campaigns:
            lines.append(
                f"- **{c.title}** (Status: {c.status}, Category: {c.category})\n"
                f"  Goal: ₹{c.goal_amount:,} | Raised: ₹{c.raised_amount:,} | End Date: {c.end_date}"
            )
        return "\n".join(lines)
    except Exception as e:
        return f"Error retrieving campaign list: {str(e)}"

def get_campaign_details(campaign_title: str) -> str:
    """
    Returns detailed information about a specific campaign by searching for its title.
    Includes description, target, raised amount, contributor stats, end date, status, UPI ID, and managing treasurer.
    """
    try:
        c = Campaign.objects.filter(title__icontains=campaign_title).first()
        if not c:
            return f"No campaign found matching '{campaign_title}'."
        
        # Calculate contribution metrics
        approved_contributions = c.contributions.filter(status='APPROVED')
        total_contributions_count = approved_contributions.count()
        unique_contributors_count = approved_contributions.values('contributor').distinct().count()
        
        res = (
            f"Campaign: **{c.title}**\n"
            f"Category: {c.category}\n"
            f"Status: {c.status}\n"
            f"Description: {c.description}\n"
            f"Goal: ₹{c.goal_amount:,}\n"
            f"Raised: ₹{c.raised_amount:,}\n"
            f"Total Approved Contributions: {total_contributions_count}\n"
            f"Unique Contributors: {unique_contributors_count}\n"
            f"Start Date: {c.start_date} | End Date: {c.end_date}\n"
        )
        if c.campaign_upi_id:
            res += f"UPI ID for payments: {c.campaign_upi_id}\n"
        if c.treasurer:
            res += f"Treasurer: {c.treasurer.get_full_name() or c.treasurer.username}\n"
        return res
    except Exception as e:
        return f"Error retrieving campaign details: {str(e)}"

def get_campaign_expenses(campaign_title: str) -> str:
    """
    Retrieves all approved expenditures/expenses for a campaign by matching its title.
    Use this to show transparency of where the campaign funds were spent.
    """
    try:
        c = Campaign.objects.filter(title__icontains=campaign_title).first()
        if not c:
            return f"No campaign found matching '{campaign_title}'."
        
        expenses = Expense.objects.filter(campaign=c, approval_status='APPROVED').order_by('-posted_at')
        if not expenses.exists():
            return f"No approved expenses recorded for campaign '{c.title}' yet."
        
        lines = [f"Approved expenses for campaign '**{c.title}**':"]
        total = 0
        for e in expenses:
            lines.append(
                f"- ₹{e.amount:,} on {e.posted_at.strftime('%d %b %Y')}: {e.description} (Category: {e.category})"
            )
            total += e.amount
        lines.append(f"\n**Total Spent: ₹{total:,}**")
        return "\n".join(lines)
    except Exception as e:
        return f"Error retrieving campaign expenses: {str(e)}"

def get_village_reserve_status() -> str:
    """
    Returns the current balance of the Village Reserve fund and summarizes recent ledger credits/debits.
    """
    try:
        reserve = VillageReserve.objects.first()
        balance = reserve.balance if reserve else 0
        
        entries = ReserveLedgerEntry.objects.all().order_by('-posted_at')[:5]
        
        res = f"🏦 **Village Reserve Status**\n"
        res += f"Current Balance: **₹{balance:,}**\n"
        if reserve and reserve.description:
            res += f"Description: {reserve.description}\n"
        
        if entries.exists():
            res += "\n**Recent Transactions:**\n"
            for entry in entries:
                campaign_str = f" (Campaign: {entry.campaign.title})" if entry.campaign else ""
                res += (
                    f"- {entry.entry_type} of ₹{entry.amount:,} on {entry.posted_at.strftime('%d %b %Y')}\n"
                    f"  Reason: {entry.reason}{campaign_str}\n"
                )
        else:
            res += "\nNo transaction history in the ledger yet."
        return res
    except Exception as e:
        return f"Error retrieving village reserve: {str(e)}"
