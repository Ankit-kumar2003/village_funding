from django.contrib import admin
from django import forms
from apps.gallery.models import GalleryPhoto

class GalleryPhotoAdminForm(forms.ModelForm):
    photo = forms.CharField(
        required=True, 
        widget=forms.TextInput(attrs={'style': 'width: 600px; font-family: monospace;'})
    )

    class Meta:
        model = GalleryPhoto
        fields = '__all__'

class GalleryPhotoAdmin(admin.ModelAdmin):
    form = GalleryPhotoAdminForm
    list_display = ('caption', 'category', 'uploaded_by', 'uploaded_at', 'is_featured')
    search_fields = ('caption',)

admin.site.register(GalleryPhoto, GalleryPhotoAdmin)
