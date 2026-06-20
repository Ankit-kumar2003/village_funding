from django.contrib import admin
from apps.contact.models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'name', 'phone_number', 'email', 'category', 'submitted_at', 'is_resolved')
    list_filter = ('category', 'is_resolved', 'submitted_at')
    search_fields = ('ticket_number', 'name', 'phone_number', 'email', 'message')
    readonly_fields = ('id', 'ticket_number', 'submitted_at', 'resolved_at')
    ordering = ('-submitted_at',)
    list_per_page = 25

    fieldsets = (
        ('Ticket Info', {
            'fields': ('ticket_number', 'submitted_at', 'is_resolved', 'resolved_at')
        }),
        ('Contact Details', {
            'fields': ('name', 'phone_number', 'email', 'category')
        }),
        ('Message', {
            'fields': ('message',)
        }),
    )
