from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.contact.views import ContactMessageViewSet

router = DefaultRouter()
router.register('contact', ContactMessageViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
