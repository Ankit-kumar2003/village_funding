import google.generativeai as genai
from django.core.management.base import BaseCommand
from decouple import config
from apps.bot.models import KBEntry

class Command(BaseCommand):
    help = "Seeds static FAQ/Guidelines into the pgvector KBEntry model"

    def handle(self, *args, **options):
        # Configure Gemini
        gemini_key = config('GEMINI_API_KEY', default='')
        if not gemini_key:
            self.stdout.write(self.style.ERROR("GEMINI_API_KEY not found in .env"))
            return
        
        genai.configure(api_key=gemini_key)

        faqs = [
            {
                "title": "How to contribute to a campaign",
                "content": (
                    "To contribute to a campaign, open the campaign page and click 'Contribute'. "
                    "You can pay using Cashfree (online instant payment) or Manual UPI/QR Code. "
                    "If you choose Manual UPI/QR Code, scan the displayed QR code, complete the transaction in your UPI app (like GPay or PhonePe), "
                    "copy the 12-digit UTR/Transaction number, paste it into the contribution form, add any optional note, and submit. "
                    "A treasurer will verify the payment and approve it. You will receive an email notification once approved."
                ),
                "category": "FAQ"
            },
            {
                "title": "Supported payment methods",
                "content": (
                    "VillageFund supports two main payment methods:\n"
                    "1. Cashfree: An online payment gateway supporting Cards, Netbanking, and instant UPI.\n"
                    "2. Manual UPI: You can scan the campaign's QR code or copy the campaign's UPI ID, make the payment manually, "
                    "and submit the transaction reference (UTR) for approval."
                ),
                "category": "FAQ"
            },
            {
                "title": "How support tickets are managed",
                "content": (
                    "If you have issues, go to the 'Contact Support' page, fill in your details, and submit a ticket. "
                    "You will receive an automatic email confirmation. "
                    "The admin or treasurer will review your ticket, take action, and update the status to 'Resolved'. "
                    "You will be notified via email immediately when the ticket status is updated."
                ),
                "category": "FAQ"
            },
            {
                "title": "What is the Village Reserve fund",
                "content": (
                    "The Village Reserve is a centralized community fund. "
                    "It receives allocations from surplus campaign funding or direct community donations. "
                    "The balance is held in a transparent account visible under the 'Transparency' tab, "
                    "and any withdrawals (debits) or deposits (credits) are logged in the Reserve Ledger."
                ),
                "category": "FAQ"
            },
            {
                "title": "How expense transparency works",
                "content": (
                    "To ensure transparency and prevent misuse of community funds, treasurers must post receipts "
                    "and descriptions for all campaign expenses. These expenses must go through an approval workflow "
                    "(or multi-signature approvals). Once approved, they are listed publicly on the campaign details page "
                    "and an email broadcast is dispatched to all registered users."
                ),
                "category": "FAQ"
            },
            {
                "title": "Platform badges and leaderboards",
                "content": (
                    "To encourage community contributions, the platform lists top contributors on the 'Leaderboard' page. "
                    "Users earn Badges (e.g. Bronze, Silver, Gold, Platinum) based on their total approved contributions "
                    "and engagement levels. Badges can be viewed on user profiles."
                ),
                "category": "FAQ"
            }
        ]

        self.stdout.write(self.style.NOTICE("Clearing existing KB entries..."))
        KBEntry.objects.all().delete()

        self.stdout.write(self.style.NOTICE("Generating embeddings and seeding..."))
        for faq in faqs:
            try:
                # Generate embedding
                response = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=faq["content"],
                    task_type="retrieval_document",
                    output_dimensionality=768
                )
                embedding = response['embedding']

                KBEntry.objects.create(
                    title=faq["title"],
                    content=faq["content"],
                    category=faq["category"],
                    embedding=embedding
                )
                self.stdout.write(self.style.SUCCESS(f"Seeded: {faq['title']}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to seed {faq['title']}: {e}"))

        self.stdout.write(self.style.SUCCESS("Knowledge Base Seeding completed successfully!"))
