import logging
import google.generativeai as genai
from django.conf import settings
from decouple import config
from pgvector.django import CosineDistance

from apps.bot.models import KBEntry, ChatSession, ChatMessage
from apps.bot import tools

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
genai.configure(api_key=GEMINI_API_KEY)

class BotBrainService:
    def __init__(self):
        self.model_name = 'models/gemini-flash-latest'
        # Define system instruction with strict guidelines to prevent hallucination
        self.system_instruction = (
            "You are VillageFund AI, the official virtual assistant for the VillageFund platform. "
            "Your objective is to provide members of the community with accurate, transparent, and "
            "helpful information regarding active fundraising campaigns, expenses, financial disclosures, "
            "and village reserves.\n\n"
            "CRITICAL RULES:\n"
            "1. Ground your answers strictly on the dynamic tool results or the static FAQ context provided. "
            "2. Never make up dates, numbers, or statuses. If you do not have the tool output for a campaign or expense, "
            "explicitly state that you do not have that information.\n"
            "3. If a tool returns an empty list or 'No campaigns found', report exactly that. "
            "4. Do not mention the existence of 'tools' or 'functions' to the user. Speak naturally.\n"
            "5. If the user query is conversational (e.g. 'Hello', 'Thank you'), reply politely and suggest they ask "
            "about village campaigns or financial reserves."
        )

    def _get_embedding(self, text: str) -> list:
        """Generates embedding vector for a given text query."""
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text,
                task_type="retrieval_query",
                output_dimensionality=768
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return []

    def _get_rag_context(self, user_query: str) -> str:
        """Retrieves top matching FAQ/Knowledge chunks from database using pgvector."""
        query_embedding = self._get_embedding(user_query)
        if not query_embedding:
            return ""

        import math
        def cosine_similarity(v1, v2):
            dot_product = sum(x*y for x, y in zip(v1, v2))
            magnitude1 = math.sqrt(sum(x*x for x in v1))
            magnitude2 = math.sqrt(sum(y*y for y in v2))
            if not magnitude1 or not magnitude2:
                return 0.0
            return dot_product / (magnitude1 * magnitude2)

        try:
            # Query pgvector for the closest 3 knowledge blocks (PostgreSQL path)
            kb_entries = KBEntry.objects.annotate(
                distance=CosineDistance('embedding', query_embedding)
            ).order_by('distance')[:3]
            
            # Evaluate the list to test if the query succeeds (will fail on SQLite)
            list(kb_entries)
            
            context_entries = []
            for entry in kb_entries:
                if entry.distance < 0.6:
                    context_entries.append(entry)
        except Exception as e:
            # SQLite fallback for local testing/development
            logger.warning(f"pgvector query failed, falling back to Python-based search: {e}")
            all_entries = list(KBEntry.objects.all())
            evaluated = []
            for entry in all_entries:
                # pgvector's CosineDistance = 1 - CosineSimilarity
                dist = 1.0 - cosine_similarity(entry.embedding, query_embedding)
                evaluated.append((entry, dist))
            
            # Sort by distance ascending
            evaluated.sort(key=lambda item: item[1])
            
            context_entries = []
            for entry, dist in evaluated[:3]:
                if dist < 0.6:
                    context_entries.append(entry)

        if not context_entries:
            return ""

        context_lines = ["\n[Static FAQ Context]:"]
        for entry in context_entries:
            context_lines.append(f"- **{entry.title}**: {entry.content}")
        
        return "\n".join(context_lines)

    def answer_question(self, user_query: str, telegram_chat_id: str) -> str:
        """Processes the query, searches database & RAG, runs tool loop, and saves history."""
        # 1. Fetch or create chat session
        session, _ = ChatSession.objects.get_or_create(telegram_chat_id=telegram_chat_id)

        # 2. Retrieve history (last 8 messages)
        history_msgs = ChatMessage.objects.filter(session=session).order_by('timestamp')[:8]
        
        # Format history for Gemini chat structure
        gemini_history = []
        for msg in history_msgs:
            role = 'user' if msg.role == 'USER' else 'model'
            gemini_history.append({
                'role': role,
                'parts': [msg.text]
            })

        # 3. Retrieve FAQ context via RAG
        rag_context = self._get_rag_context(user_query)
        
        # 4. Construct current prompt containing query and context
        full_prompt = user_query
        if rag_context:
            full_prompt = f"{user_query}\n{rag_context}"

        try:
            # 5. Initialise model with bound DB tools
            model = genai.GenerativeModel(
                model_name=self.model_name,
                tools=[
                    tools.get_campaigns_list,
                    tools.get_campaign_details,
                    tools.get_campaign_expenses,
                    tools.get_village_reserve_status
                ],
                system_instruction=self.system_instruction
            )

            # Start chat with history & auto-function calling enabled
            chat = model.start_chat(
                history=gemini_history,
                enable_automatic_function_calling=True
            )

            # Send message and resolve tool call loop
            response = chat.send_message(full_prompt)
            final_text = response.text

            # 6. Save messages to history
            ChatMessage.objects.create(session=session, role='USER', text=user_query)
            ChatMessage.objects.create(session=session, role='MODEL', text=final_text)

            return final_text

        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return (
                "Sorry, I encountered an issue accessing the database to answer your request. "
                "Please try again in a few moments."
            )
