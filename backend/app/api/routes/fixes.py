from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.fixes import FixSuggestionRequest, FixSuggestionResponse
from app.services.database import upsert_user, create_fix

router = APIRouter()


def _resolve_user(db: Session, current_user: AuthUser):
    return upsert_user(
        db,
        supabase_user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        auth_provider="google",
    )


@router.post("/fixes", response_model=FixSuggestionResponse, status_code=status.HTTP_201_CREATED)
def create_fix_route(request: FixSuggestionRequest, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    # For now, use the existing pipeline to suggest a fix using the fix_suggestion agent
    from app.agents.fix_suggestion import suggest_fixes

    user = _resolve_user(db, current_user)
    suggested = suggest_fixes(request.original_code, request.language or "", "", {})

    fixed_code = suggested.get("improved_code") or suggested.get("recommended_fix") or ""
    explanation = suggested.get("explanation") or suggested.get("recommended_fix") or ""

    fix = create_fix(db, user_id=user.id, original_code=request.original_code, fixed_code=fixed_code, explanation=explanation)
    db.commit()
    return FixSuggestionResponse(
        id=fix.id,
        user_id=fix.user_id,
        original_code=fix.original_code,
        fixed_code=fix.fixed_code,
        explanation=fix.explanation,
        validation_json=fix.validation_json,
        created_at=fix.created_at,
    )
