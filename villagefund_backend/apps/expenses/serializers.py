from rest_framework import serializers
from .models import Expense, ExpenseApproval
from apps.users.serializers import UserSerializer

class ExpenseApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    class Meta:
        model = ExpenseApproval
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.full_name', read_only=True)
    approvals = ExpenseApprovalSerializer(many=True, read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('id', 'posted_by', 'approval_status', 'requires_multi_sig', 'approval_count')
