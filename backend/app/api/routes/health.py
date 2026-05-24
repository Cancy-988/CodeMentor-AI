from fastapi import APIRouter, Header
from sqlalchemy import text
from app.db.session import engine
from app.core.config import settings
from app.core.auth import get_optional_current_user

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "CodeMentor AI backend is running."}


@router.get("/debug")
def debug_check(authorization: str | None = Header(default=None)):
    """Diagnostic endpoint to help troubleshoot common deployment issues.

    Returns DB connectivity, Supabase config presence, and optional user parsed from the Authorization header.
    """
    result = {"db_ok": False, "db_error": None, "supabase_configured": False, "user": None}

    # DB check
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        result["db_ok"] = True
    except Exception as exc:
        result["db_error"] = str(exc)

    # Supabase config
    result["supabase_configured"] = bool(settings.supabase_url and settings.supabase_anon_key)

    # Optional user (do not raise)
    try:
        user = get_optional_current_user(authorization)
        if user is not None:
            result["user"] = {"id": user.id, "email": user.email}
    except Exception as exc:
        result["user_error"] = str(exc)

    return result
