from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, CampaignUpdateViewSet

router = DefaultRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaign')

urlpatterns = [
    path('', include(router.urls)),
    path('campaigns/<uuid:campaign_pk>/updates/', CampaignUpdateViewSet.as_view({'get': 'list', 'post': 'create'}), name='campaign-updates'),
]
