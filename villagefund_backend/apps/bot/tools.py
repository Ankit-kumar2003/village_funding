import logging
from django.db import connection

logger = logging.getLogger(__name__)

def execute_readonly_sql_query(sql_query: str) -> str:
    """
    Executes a read-only SQL query against the database to fetch live stats and reports.
    Only SELECT statements are permitted. Sensitive user/auth columns are blocked for security.
    """
    # Clean query
    query_clean = sql_query.strip().lower()
    
    # Guardrail 1: Block writing, modifying, or schema changing actions
    if not query_clean.startswith("select"):
        return "Error: Database access is restricted to read-only queries (SELECT statements only)."
        
    # Guardrail 2: Block destructive SQL keywords
    blocked_actions = ["insert ", "update ", "delete ", "drop ", "alter ", "create ", "truncate ", "replace ", "grant "]
    if any(action in query_clean for action in blocked_actions):
        return "Error: Modifying keywords are strictly prohibited."

    # Guardrail 3: Block access to credentials/private columns
    blocked_columns = ["password", "token", "secret", "is_superuser", "is_staff", "email", "utr_number", "instamojo", "cashfree"]
    if any(col in query_clean for col in blocked_columns):
        return "Error: Access to sensitive/private tables or columns is restricted for privacy."

    try:
        with connection.cursor() as cursor:
            # Force read-only transaction state (standard in PostgreSQL, safe fallback in SQLite)
            try:
                cursor.execute("SET TRANSACTION READ ONLY;")
            except Exception:
                # SQLite doesn't support setting transaction characteristics this way, ignore
                pass

            # SQLite compatibility fallback for ILIKE
            if connection.vendor == 'sqlite':
                sql_query = sql_query.replace(" ILIKE ", " LIKE ").replace(" ilike ", " like ")

            cursor.execute(sql_query)
            
            # Fetch results
            if cursor.description is None:
                return "Query executed successfully, but returned no columns."
                
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            
            if not rows:
                return "No records found matching this query."

            # Format into JSON-like key-value structures for LLM readability
            results = []
            for row in rows[:50]:  # Limit to 50 rows to prevent token window overflow
                results.append(dict(zip(columns, row)))
                
            return str(results)
    except Exception as e:
        logger.error(f"SQL execution error: {e}")
        return f"Database error during execution: {str(e)}"
