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
    actions = ['send_contribution_reminder']

    def send_contribution_reminder(self, request, queryset):
        sent_count = 0
        for campaign in queryset:
            if campaign.status == 'ACTIVE':
                from apps.notifications.emails import broadcast_campaign_reminder
                import threading
                title = f"Urgent Contribution Reminder: {campaign.title}"
                body = f"The campaign '{campaign.title}' needs your support. We have raised ₹{campaign.raised_amount} of our ₹{campaign.goal_amount} goal. Please consider making a contribution to help us reach our target!"
                threading.Thread(target=broadcast_campaign_reminder, args=(campaign.id, title, body), daemon=True).start()
                sent_count += 1
        
        if sent_count > 0:
            self.message_user(request, f"Contribution reminders for {sent_count} active campaign(s) are being dispatched to all registered users.")
        else:
            self.message_user(request, "No active campaigns were selected. Reminders were not sent.", level='warning')
    send_contribution_reminder.short_description = "Send contribution reminder to all users"


admin.site.register(Campaign, CampaignAdmin)
admin.site.register(CampaignMilestone)
admin.site.register(CampaignBudgetItem)
admin.site.register(CampaignUpdate)
admin.site.register(CampaignVote)
admin.site.register(CampaignComment)
admin.site.register(Sponsorship)
