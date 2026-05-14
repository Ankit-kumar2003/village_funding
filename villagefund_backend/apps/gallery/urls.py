from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GalleryPhotoViewSet

router = DefaultRouter()
router.register(r'gallery', GalleryPhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
