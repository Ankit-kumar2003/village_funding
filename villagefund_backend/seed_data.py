import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'villagefund.settings')
django.setup()

from apps.users.models import User
from apps.campaigns.models import Campaign, CampaignBudgetItem, CampaignUpdate

def seed():
    admin_user = User.objects.filter(username='admin').first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123', phone_number='0000000000', full_name='System Admin', role='SUPER_ADMIN')
    
    treasurer, _ = User.objects.get_or_create(username='treasurer', defaults={'phone_number':'1111111111', 'full_name':'Village Treasurer', 'role':'TREASURER'})
    treasurer.set_password('treasurer123')
    treasurer.save()
    
    if Campaign.objects.count() == 0:
        c1 = Campaign.objects.create(
            title='Sundarpur Primary School Roof Repair', 
            description='The primary school roof has been leaking during the monsoon. We need to replace the tin sheets and reinforce the wooden beams before the next rainy season to ensure the children can study safely.', 
            category='EDUCATION', 
            goal_amount=50000, 
            raised_amount=15000, 
            status='ACTIVE', 
            start_date=timezone.now().date(), 
            end_date=(timezone.now() + timedelta(days=30)).date(), 
            created_by=admin_user, 
            treasurer=treasurer
        )
        CampaignBudgetItem.objects.create(campaign=c1, label='Tin Sheets', planned_amount=30000)
        CampaignBudgetItem.objects.create(campaign=c1, label='Labor Costs', planned_amount=20000)
        CampaignUpdate.objects.create(campaign=c1, posted_by=admin_user, title='Roofing material ordered', body='We have successfully placed an order for 50 high quality tin sheets. They should arrive next week.')
        
        c2 = Campaign.objects.create(
            title='Village Main Road Solar Lights', 
            description='Installing 10 solar-powered street lights along the main road from the highway to the village square to improve safety at night.', 
            category='INFRASTRUCTURE', 
            goal_amount=120000, 
            raised_amount=120000, 
            status='FUNDED', 
            start_date=(timezone.now() - timedelta(days=60)).date(), 
            end_date=(timezone.now() - timedelta(days=10)).date(), 
            created_by=admin_user, 
            treasurer=treasurer
        )
        CampaignBudgetItem.objects.create(campaign=c2, label='10 Solar Lights', planned_amount=100000)
        CampaignBudgetItem.objects.create(campaign=c2, label='Installation', planned_amount=20000)
        CampaignUpdate.objects.create(campaign=c2, posted_by=admin_user, title='All lights installed!', body='The final solar light was installed today. The village road is now fully illuminated at night.')
        
        c3 = Campaign.objects.create(
            title='Community Medical Camp & Free Checkup', 
            description='A 2-day medical camp with specialist doctors from Ambala City. Funds will cover doctor transport, basic medicines, and setup costs.', 
            category='HEALTH', 
            goal_amount=25000, 
            raised_amount=5000, 
            status='ACTIVE', 
            start_date=timezone.now().date(), 
            end_date=(timezone.now() + timedelta(days=15)).date(), 
            created_by=admin_user, 
            treasurer=treasurer
        )
        CampaignBudgetItem.objects.create(campaign=c3, label='Medicines', planned_amount=15000)
        CampaignBudgetItem.objects.create(campaign=c3, label='Doctor Transport', planned_amount=5000)
        CampaignBudgetItem.objects.create(campaign=c3, label='Tent and Chairs', planned_amount=5000)
        
        print('Dummy data successfully generated!')
    else:
        print('Data already exists.')

if __name__ == '__main__':
    seed()
