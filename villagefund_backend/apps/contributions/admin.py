from django.contrib import admin
from apps.contributions.models import Pledge, Contribution

admin.site.register(Pledge)
admin.site.register(Contribution)
