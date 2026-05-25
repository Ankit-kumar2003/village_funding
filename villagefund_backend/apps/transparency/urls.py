from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StatsView, ReserveViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'reserve', ReserveViewSet, basename='reserve')
router.register(r'audit-log', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', StatsView.as_view(), name='platform-stats'),
]
