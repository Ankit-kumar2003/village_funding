from django.contrib import admin
from apps.users.models import User, ContributionStreak

admin.site.register(User)
admin.site.register(ContributionStreak)
