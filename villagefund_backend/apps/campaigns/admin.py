from django.contrib import admin
from django import forms
from apps.campaigns.models import Campaign, CampaignMilestone, CampaignBudgetItem, CampaignUpdate, CampaignVote, CampaignComment, Sponsorship

class CampaignAdminForm(forms.ModelForm):
    cover_image = forms.CharField(
        required=False, 
        widget=forms.TextInput(attrs={'style': 'width: 600px; font-family: monospace;'})
    )
    campaign_qr_image = forms.CharField(
        required=False, 
        widget=forms.TextInput(attrs={'style': 'width: 600px; font-family: monospace;'})
    )

    class Meta:
        model = Campaign
        fields = '__all__'

class CampaignAdmin(admin.ModelAdmin):
    form = CampaignAdminForm
    list_display = ('title', 'category', 'goal_amount', 'raised_amount', 'status', 'start_date')
    search_fields = ('title', 'description')

admin.site.register(Campaign, CampaignAdmin)
admin.site.register(CampaignMilestone)
admin.site.register(CampaignBudgetItem)
admin.site.register(CampaignUpdate)
admin.site.register(CampaignVote)
admin.site.register(CampaignComment)
admin.site.register(Sponsorship)
