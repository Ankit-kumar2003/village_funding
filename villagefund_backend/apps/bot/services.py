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
            "You have access to a SQL execution tool: `execute_readonly_sql_query`.\n"
            "Whenever the user asks a question about dynamic data (e.g. campaigns, contributions, expenses, reserve balances, ledger entries, or contributor counts), "
            "you MUST formulate a valid PostgreSQL SELECT query and call the tool to fetch the live data.\n\n"
            "DATABASE SCHEMA & RELATIONSHIPS:\n"
            "1. Table `users_user` (Represents users):\n"
            "   - `id` (UUID, primary key)\n"
            "   - `username` (VARCHAR)\n"
            "   - `first_name` (VARCHAR)\n"
            "   - `last_name` (VARCHAR)\n"
            "   - `role` (VARCHAR: 'MEMBER', 'TREASURER', 'SUPER_ADMIN')\n"
            "   (Note: Do NOT query private fields like password, email, or is_superuser)\n"
            "2. Table `campaigns_campaign` (Represents fundraising campaigns):\n"
            "   - `id` (UUID, primary key)\n"
            "   - `title` (VARCHAR)\n"
            "   - `description` (TEXT)\n"
            "   - `category` (VARCHAR: 'RELIGIOUS', 'INFRASTRUCTURE', 'SOCIAL', 'CULTURAL', 'EDUCATION', 'HEALTH')\n"
            "   - `goal_amount` (DECIMAL)\n"
            "   - `raised_amount` (DECIMAL)\n"
            "   - `status` (VARCHAR: 'DRAFT', 'VOTING', 'ACTIVE', 'FUNDED', 'COMPLETED', 'CANCELLED', 'ARCHIVED')\n"
            "   - `start_date` (DATE)\n"
            "   - `end_date` (DATE)\n"
            "   - `campaign_upi_id` (VARCHAR)\n"
            "   - `treasurer_id` (UUID, references users_user.id)\n"
            "3. Table `contributions_contribution` (Represents user contributions):\n"
            "   - `id` (UUID, primary key)\n"
            "   - `campaign_id` (UUID, references campaigns_campaign.id)\n"
            "   - `contributor_id` (UUID, references users_user.id)\n"
            "   - `amount` (DECIMAL)\n"
            "   - `status` (VARCHAR: 'PENDING', 'APPROVED', 'REJECTED')\n"
            "   - `payment_method` (VARCHAR)\n"
            "   - `submitted_at` (DATETIME)\n"
            "   - `note` (VARCHAR)\n"
            "4. Table `expenses_expense` (Represents approved campaign expenses/disbursements):\n"
            "   - `id` (UUID, primary key)\n"
            "   - `campaign_id` (UUID, references campaigns_campaign.id)\n"
            "   - `amount` (DECIMAL)\n"
            "   - `description` (VARCHAR)\n"
            "   - `category` (VARCHAR)\n"
            "   - `posted_at` (DATETIME)\n"
            "   - `approval_status` (VARCHAR: 'PENDING', 'APPROVED', 'REJECTED')\n"
            "5. Table `transparency_villagereserve` (Represents centralized reserve funds):\n"
            "   - `id` (UUID, primary key)\n"
            "   - `balance` (DECIMAL)\n"
            "   - `last_updated` (DATETIME)\n"
            "   - `description` (TEXT)\n"
            "6. Table `transparency_reserveledgerentry` (Represents reserve deposit/withdrawal history):\n"
            "   - `id` (UUID, primary key)\n"
            "   - `amount` (DECIMAL)\n"
            "   - `entry_type` (VARCHAR: 'CREDIT', 'DEBIT')\n"
            "   - `reason` (VARCHAR)\n"
            "   - `campaign_id` (UUID, references campaigns_campaign.id)\n"
            "   - `posted_at` (DATETIME)\n\n"
            "CRITICAL RULES:\n"
            "1. Ground your answers strictly on the tool results or the static FAQ context provided.\n"
            "2. Never make up dates, numbers, or names. If a SQL query returns no records, state that no records match.\n"
            "3. Formulate SQL queries matching the user's intent. For example:\n"
            "   - To find the number of unique contributors: `SELECT COUNT(DISTINCT contributor_id) FROM contributions_contribution WHERE campaign_id = ... AND status = 'APPROVED'`\n"
            "   - To list contributor names: `SELECT u.username, u.first_name, u.last_name, c.amount FROM contributions_contribution c JOIN users_user u ON c.contributor_id = u.id WHERE c.campaign_id = ... AND c.status = 'APPROVED'`\n"
            "   - To search a campaign by title: use `ILIKE '%title%'` (e.g. `SELECT * FROM campaigns_campaign WHERE title ILIKE '%school%'`)\n"
            "4. Do not mention the word 'tool' or 'database query' or 'SQL' to the user. Speak naturally.\n"
            "5. If a query is conversational (e.g. 'Hello'), respond politely and suggest they ask about village campaigns, expenses, or reserve funds."
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
                    tools.execute_readonly_sql_query
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
            err_msg = str(e).lower()
            if "429" in err_msg or "quota" in err_msg:
                return (
                    "⚠️ The AI Assistant's request quota has been exceeded for the minute/day on this free key. "
                    "Please wait a brief moment and try again."
                )
            return (
                "Sorry, I encountered an issue answering your request. "
                "Please try again in a few moments."
            )
