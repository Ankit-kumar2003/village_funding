import json
import io
import logging
import requests
import google.generativeai as genai
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from decouple import config
from gtts import gTTS

from apps.bot.services import BotBrainService
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)

# Configure Telegram credentials
TELEGRAM_BOT_TOKEN = config('TELEGRAM_BOT_TOKEN', default='')
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

bot_service = BotBrainService()

def send_telegram_message(chat_id: str, text: str):
    """Sends a text message to a specific Telegram chat."""
    url = f"{TELEGRAM_API_URL}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code != 200:
            logger.error(f"Failed to send Telegram message: {response.text}")
    except Exception as e:
        logger.error(f"Error sending Telegram message: {e}")

def send_telegram_voice(chat_id: str, voice_bytes: bytes, caption: str = None):
    """Sends a voice message containing synthesized audio to a specific Telegram chat."""
    url = f"{TELEGRAM_API_URL}/sendVoice"
    files = {
        'voice': ('voice.mp3', voice_bytes, 'audio/mpeg')
    }
    payload = {
        'chat_id': chat_id
    }
    if caption:
        # Telegram captions have a limit of 1024 characters
        payload['caption'] = caption[:1000]
        payload['parse_mode'] = 'Markdown'
        
    try:
        response = requests.post(url, data=payload, files=files, timeout=20)
        if response.status_code != 200:
            logger.error(f"Failed to send Telegram voice: {response.text}")
    except Exception as e:
        logger.error(f"Error sending Telegram voice: {e}")

def speech_to_text(audio_bytes: bytes) -> str:
    """Uses Gemini to transcribe an audio file directly from bytes in-memory."""
    # Configure inside function to ensure API key is active
    gemini_key = config('GEMINI_API_KEY', default='')
    genai.configure(api_key=gemini_key)
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([
        {
            'mime_type': 'audio/ogg',
            'data': audio_bytes
        },
        "Transcribe this audio precisely into text. Do not translate. Output ONLY the transcribed text."
    ])
    return response.text.strip()

def text_to_speech(text: str) -> io.BytesIO:
    """Converts text to speech using gTTS, auto-detecting Devanagari characters for Hindi support."""
    # Detect if response has Devanagari character block (Hindi)
    is_hindi = any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in text)
    language = 'hi' if is_hindi else 'en'
    
    # Strip markdown symbols so TTS engine doesn't speak out asterisks or hashtags
    clean_text = text.replace('*', '').replace('_', '').replace('`', '').replace('#', '')
    
    tts = gTTS(text=clean_text, lang=language, slow=False)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp

@csrf_exempt
@require_POST
def telegram_webhook(request):
    """Webhook endpoint for receiving Telegram updates (supports voice and text)."""
    try:
        data = json.loads(request.body.decode('utf-8'))
        message = data.get('message', {})
        chat_id = message.get('chat', {}).get('id')
        
        if not chat_id:
            return HttpResponse("OK")
        
        # 1. Handle Text Input
        if 'text' in message:
            user_text = message['text']
            
            # Handle start command
            if user_text.strip() == '/start':
                welcome_text = (
                    "👋 **Welcome to the VillageFund AI Assistant!**\n\n"
                    "I am here to help you transparently monitor village finances, campaign progress, and guidelines.\n\n"
                    "Ask me questions like:\n"
                    "- *What is the reserve balance?*\n"
                    "- *Show me active campaigns.*\n"
                    "- *What were the expenses for School Repair?*\n"
                    "- *How do I make a contribution?*\n\n"
                    "You can type a message or **send a voice note**!"
                )
                send_telegram_message(chat_id, welcome_text)
                return HttpResponse("OK")
            
            # Generate AI response
            reply_text = bot_service.answer_question(user_text, str(chat_id))
            send_telegram_message(chat_id, reply_text)
            
        # 2. Handle Voice Input
        elif 'voice' in message:
            voice_info = message['voice']
            file_id = voice_info['file_id']
            
            # Request file path from Telegram
            file_info_url = f"{TELEGRAM_API_URL}/getFile?file_id={file_id}"
            file_info_resp = requests.get(file_info_url, timeout=10).json()
            file_path = file_info_resp.get('result', {}).get('file_path')
            
            if file_path:
                # Download audio file bytes
                download_url = f"https://api.telegram.org/file/bot{TELEGRAM_BOT_TOKEN}/{file_path}"
                audio_resp = requests.get(download_url, timeout=15)
                audio_bytes = audio_resp.content
                
                # Transcribe speech
                try:
                    user_text = speech_to_text(audio_bytes)
                except Exception as ex:
                    logger.error(f"Failed to transcribe voice message: {ex}")
                    send_telegram_message(chat_id, "Sorry, I couldn't transcribe the audio. Please try typing or speaking more clearly.")
                    return HttpResponse("OK")
                
                if not user_text:
                    send_telegram_message(chat_id, "I heard some sound, but couldn't decode any speech. Please try speaking clearly.")
                    return HttpResponse("OK")
                
                # Generate AI response
                reply_text = bot_service.answer_question(user_text, str(chat_id))
                
                # Convert response to speech
                try:
                    tts_fp = text_to_speech(reply_text)
                    send_telegram_voice(chat_id, tts_fp.read(), caption=f"📝 Transcript:\n{reply_text}")
                except Exception as tts_ex:
                    logger.error(f"Failed to synthesize voice reply: {tts_ex}")
                    # Fallback to standard text message if TTS fails
                    send_telegram_message(chat_id, reply_text)
            else:
                logger.error("Could not retrieve file path from Telegram API.")
                send_telegram_message(chat_id, "Sorry, I couldn't download your voice message. Please try again.")

        return HttpResponse("OK")
    except Exception as e:
        logger.error(f"Telegram webhook error: {e}")
        return HttpResponse("OK") # Always return 200 to Telegram to prevent webhook retries


@api_view(['POST'])
@permission_classes([AllowAny])
def web_chat(request):
    """API endpoint for the web chatbot interface."""
    user_message = request.data.get('message', '')
    session_id = request.data.get('session_id', 'web_anonymous_session')
    
    if not user_message:
        return Response({"error": "Message is required"}, status=400)
    
    # If user is authenticated, associate session with user ID for history & user-specific RAG/Tools
    if request.user and request.user.is_authenticated:
        session_id = f"web_user_{request.user.id}"
        
    try:
        reply_text = bot_service.answer_question(user_message, session_id)
        return Response({"response": reply_text})
    except Exception as e:
        logger.error(f"Web chat error: {e}")
        return Response({"error": "Failed to process chat"}, status=500)
