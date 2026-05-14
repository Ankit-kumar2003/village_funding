from django.contrib import admin
from apps.transparency.models import VillageReserve, ReserveLedgerEntry, TreasurerDeclaration, AuditLog

admin.site.register(VillageReserve)
admin.site.register(ReserveLedgerEntry)
admin.site.register(TreasurerDeclaration)
admin.site.register(AuditLog)
