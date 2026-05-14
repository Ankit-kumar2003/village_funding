from django.contrib import admin
from apps.campaigns.models import Campaign, CampaignMilestone, CampaignBudgetItem, CampaignUpdate, CampaignVote, CampaignComment, Sponsorship

admin.site.register(Campaign)
admin.site.register(CampaignMilestone)
admin.site.register(CampaignBudgetItem)
admin.site.register(CampaignUpdate)
admin.site.register(CampaignVote)
admin.site.register(CampaignComment)
admin.site.register(Sponsorship)
