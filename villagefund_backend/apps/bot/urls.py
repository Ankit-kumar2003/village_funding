from django.urls import path
from .views import telegram_webhook, web_chat

urlpatterns = [
    path('telegram/webhook/', telegram_webhook, name='telegram_webhook'),
    path('chat/', web_chat, name='web_chat'),
]
