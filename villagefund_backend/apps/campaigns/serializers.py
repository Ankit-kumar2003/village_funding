from rest_framework import serializers
from .models import Campaign, CampaignMilestone, CampaignBudgetItem, CampaignUpdate, CampaignComment, Sponsorship
from apps.users.serializers import UserSerializer

class CampaignBudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignBudgetItem
        fields = '__all__'

class CampaignMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignMilestone
        fields = '__all__'

class CampaignUpdateSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    class Meta:
        model = CampaignUpdate
        fields = '__all__'

class CampaignCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = CampaignComment
        fields = '__all__'

class SponsorshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsorship
        fields = '__all__'

class CampaignListSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = ('id', 'title', 'category', 'goal_amount', 'raised_amount', 'status', 'start_date', 'end_date', 'cover_image', 'progress_percentage')

    def get_progress_percentage(self, obj):
        if obj.goal_amount > 0:
            return min(100, int((obj.raised_amount / obj.goal_amount) * 100))
        return 0

class CampaignDetailSerializer(serializers.ModelSerializer):
    budget_items = CampaignBudgetItemSerializer(many=True, read_only=True)
    milestones = CampaignMilestoneSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    treasurer = UserSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = '__all__'

    def get_progress_percentage(self, obj):
        if obj.goal_amount > 0:
            return min(100, int((obj.raised_amount / obj.goal_amount) * 100))
        return 0
