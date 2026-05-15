from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "VillageFund Admin"
admin.site.site_title = "VillageFund Admin Portal"
admin.site.index_title = "Welcome to VillageFund Admin Portal"
admin.site.site_url = "https://village-funding.vercel.app"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.campaigns.urls')),
    path('api/', include('apps.contributions.urls')),
    path('api/', include('apps.expenses.urls')),
    path('api/', include('apps.gallery.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
