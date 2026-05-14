from rest_framework import serializers
from .models import Contribution, Pledge
from apps.users.serializers import UserSerializer

class ContributionSerializer(serializers.ModelSerializer):
    contributor_name = serializers.CharField(source='contributor.full_name', read_only=True)
    
    class Meta:
        model = Contribution
        fields = ('id', 'campaign', 'contributor', 'contributor_name', 'amount', 'utr_number', 'payment_method', 'status', 'submitted_at', 'note')
        read_only_fields = ('id', 'status', 'submitted_at', 'contributor', 'contributor_name')

class PledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pledge
        fields = '__all__'
