from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.services.database import upsert_user
from app.schemas.auth import AuthMeResponse
from app.schemas.auth import AuthUser

router = APIRouter()


@router.get("/auth/me", response_model=AuthMeResponse)
def auth_me(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    upsert_user(
        db,
        supabase_user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        auth_provider="google",
    )
    db.commit()
    return AuthMeResponse(user=current_user)