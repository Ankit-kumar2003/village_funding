from rest_framework import serializers
from apps.contact.models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            'id', 'ticket_number', 'name', 'phone_number', 'email',
            'category', 'category_display', 'message',
            'submitted_at', 'is_resolved', 'resolved_at'
        ]
        read_only_fields = ['id', 'ticket_number', 'submitted_at', 'is_resolved', 'resolved_at']

