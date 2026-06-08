from rest_framework import serializers
from .models import GalleryPhoto

class GalleryPhotoSerializer(serializers.ModelSerializer):
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    photo = serializers.CharField(required=True)
    class Meta:
        model = GalleryPhoto
        fields = '__all__'
        read_only_fields = ('uploaded_by',)
