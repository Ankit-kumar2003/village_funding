from django.contrib import admin
from apps.badges.models import Badge, UserBadge

admin.site.register(Badge)
admin.site.register(UserBadge)
