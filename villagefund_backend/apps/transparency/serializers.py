from rest_framework import serializers
from .models import VillageReserve, ReserveLedgerEntry, AuditLog

class VillageReserveSerializer(serializers.ModelSerializer):
    class Meta:
        model = VillageReserve
        fields = '__all__'

class ReserveLedgerEntrySerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.full_name', read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = ReserveLedgerEntry
        fields = ('id', 'amount', 'entry_type', 'reason', 'campaign', 'campaign_title', 'posted_by', 'posted_by_name', 'posted_at')
        read_only_fields = ('id', 'posted_by', 'posted_at')

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.full_name', read_only=True)

    class Meta:
        model = AuditLog
        fields = ('id', 'actor', 'actor_name', 'action', 'target_model', 'target_id', 'meta', 'ip_address', 'timestamp')
