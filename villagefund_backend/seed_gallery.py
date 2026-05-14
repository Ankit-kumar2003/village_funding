import os
import django
import uuid

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'villagefund.settings')
django.setup()

from apps.gallery.models import GalleryPhoto
from apps.campaigns.models import Campaign
from apps.users.models import User

def seed_gallery():
    print("Seeding Gallery with sample projects...")
    
    # Get an admin user to be the uploader
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        admin = User.objects.create_superuser('admin_temp', 'admin@test.com', 'admin123')
        print(f"Created temp admin: {admin.username}")

    # Get some campaigns
    campaigns = Campaign.objects.all()
    
    sample_photos = [
        {
            'caption': 'Old Village Well - Before Restoration',
            'category': 'BEFORE',
            'url': 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&q=80&w=800',
            'campaign': campaigns[0] if len(campaigns) > 0 else None
        },
        {
            'caption': 'Restored Clean Water Well',
            'category': 'AFTER',
            'url': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
            'campaign': campaigns[0] if len(campaigns) > 0 else None
        },
        {
            'caption': 'Digital Classroom Installation',
            'category': 'DURING',
            'url': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
            'campaign': campaigns[1] if len(campaigns) > 1 else None
        },
        {
            'caption': 'Annual Village Health Camp',
            'category': 'EVENT',
            'url': 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800',
            'campaign': None
        },
        {
            'caption': 'Solar Street Lights - Project Kickoff',
            'category': 'BEFORE',
            'url': 'https://images.unsplash.com/photo-1542350327-01217ec614d1?auto=format&fit=crop&q=80&w=800',
            'campaign': campaigns[2] if len(campaigns) > 2 else None
        },
        {
            'caption': 'Village Road Repair in Progress',
            'category': 'DURING',
            'url': 'https://images.unsplash.com/photo-1541625602330-2277a4c4b282?auto=format&fit=crop&q=80&w=800',
            'campaign': None
        }
    ]

    for item in sample_photos:
        # Note: In a real app, we would download the image and save to models.ImageField.
        # For this demonstration, we'll store the URL as a string if we can, 
        # but since 'photo' is an ImageField, we'll just create the records 
        # and let the frontend 'onError' handle the broken local path by using 
        # the caption/logic to show placeholders or I can manually hack the URL in.
        
        # To make it work for the frontend demonstration WITHOUT actual file uploads:
        # I'll create the record. In the frontend, I've already added an 'onError' handler.
        GalleryPhoto.objects.create(
            caption=item['caption'],
            category=item['category'],
            campaign=item['campaign'],
            uploaded_by=admin,
            photo='dummy.jpg' # This will trigger the onError in frontend
        )

    print("Successfully seeded gallery items!")

if __name__ == '__main__':
    seed_gallery()
