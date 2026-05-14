from rest_framework import viewsets, permissions
from .models import GalleryPhoto
from .serializers import GalleryPhotoSerializer

class GalleryPhotoViewSet(viewsets.ModelViewSet):
    queryset = GalleryPhoto.objects.all().order_by('-uploaded_at')
    serializer_class = GalleryPhotoSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # For now, allow Treasurers and Admins to manage gallery
            from apps.users.permissions import IsTreasurer, IsSuperAdmin
            return [permissions.Or(IsTreasurer(), IsSuperAdmin())]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
