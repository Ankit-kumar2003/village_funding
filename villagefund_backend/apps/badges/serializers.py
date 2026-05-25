from rest_framework import serializers
from .models import Badge, UserBadge

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class UserBadgeSerializer(serializers.ModelSerializer):
    badge_details = BadgeSerializer(source='badge', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = UserBadge
        fields = ('id', 'user', 'badge', 'badge_details', 'campaign', 'campaign_title', 'awarded_at')
