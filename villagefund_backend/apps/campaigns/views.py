from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Campaign, CampaignUpdate, CampaignComment
from .serializers import CampaignListSerializer, CampaignDetailSerializer, CampaignUpdateSerializer, CampaignCommentSerializer
from apps.users.permissions import IsTreasurer, IsSuperAdmin
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all().order_by('-created_at')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'category']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return CampaignListSerializer
        return CampaignDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsTreasurer()]
        if self.action == 'destroy':
            return [IsSuperAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        campaign = self.get_object()
        data = {
            'goal_amount': campaign.goal_amount,
            'raised_amount': campaign.raised_amount,
        }
        return Response(data)

class CampaignUpdateViewSet(viewsets.ModelViewSet):
    queryset = CampaignUpdate.objects.all().order_by('-posted_at')
    serializer_class = CampaignUpdateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return self.queryset.filter(campaign_id=self.kwargs['campaign_pk'])

    def perform_create(self, serializer):
        campaign = Campaign.objects.get(pk=self.kwargs['campaign_pk'])
        serializer.save(campaign=campaign, posted_by=self.request.user)
