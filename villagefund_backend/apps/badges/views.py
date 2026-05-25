from rest_framework import viewsets, permissions
from .models import Badge, UserBadge
from .serializers import BadgeSerializer, UserBadgeSerializer

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).order_by('-awarded_at')
