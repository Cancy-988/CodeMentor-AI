from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.services.database import upsert_user, get_review, list_reviews

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


@router.get("/reviews")
def list_reviews_route(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    rows = list_reviews(db, user_id=user.id)
    results = []
    for r in rows:
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "chat_id": r.chat_id,
            "language": getattr(r, "language", None),
            "score": getattr(r, "score", None),
            "code": getattr(r, "code", None),
            "result_json": getattr(r, "result_json", None),
            "created_at": r.created_at,
        })
    return results


@router.get("/reviews/{review_id}")
def get_review_route(review_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    r = get_review(db, review_id=review_id)
    if r is None or r.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return {
        "id": r.id,
        "user_id": r.user_id,
        "chat_id": r.chat_id,
        "language": getattr(r, "language", None),
        "score": getattr(r, "score", None),
        "code": getattr(r, "code", None),
        "result_json": getattr(r, "result_json", None),
        "created_at": r.created_at,
    }
