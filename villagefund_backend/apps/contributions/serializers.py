from rest_framework import serializers
from .models import Contribution, Pledge
from apps.users.serializers import UserSerializer

class ContributionSerializer(serializers.ModelSerializer):
    contributor_name = serializers.CharField(source='contributor.full_name', read_only=True)
    
    class Meta:
        model = Contribution
        fields = ('id', 'campaign', 'contributor', 'contributor_name', 'amount', 'utr_number', 'payment_method', 'status', 'submitted_at', 'note')
        read_only_fields = ('id', 'status', 'submitted_at', 'contributor', 'contributor_name')

class ContributorExportSerializer(serializers.ModelSerializer):
    """Serializer for the public transparency / contributor export report."""
    contributor_name = serializers.CharField(source='contributor.full_name', read_only=True)
    contributor_email = serializers.CharField(source='contributor.email', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    campaign_id = serializers.UUIDField(source='campaign.id', read_only=True)
    # Best available payment reference: prefer cashfree_payment_id, fall back to utr_number
    payment_reference = serializers.SerializerMethodField()

    class Meta:
        model = Contribution
        fields = (
            'id',
            'contributor_name',
            'contributor_email',
            'amount',
            'submitted_at',
            'payment_method',
            'payment_reference',
            'campaign_title',
            'campaign_id',
            'status',
        )

    def get_payment_reference(self, obj):
        return obj.cashfree_payment_id or obj.utr_number or str(obj.id)

class PledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pledge
        fields = '__all__'
