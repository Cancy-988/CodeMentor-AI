from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.services.database import upsert_user, get_upload, list_uploads

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


@router.get("/uploads")
def list_uploads_route(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    rows = list_uploads(db, user_id=user.id)
    results = []
    for u in rows:
        results.append({
            "id": u.id,
            "user_id": u.user_id,
            "chat_id": u.chat_id,
            "file_name": getattr(u, "file_name", None),
            "storage_path": getattr(u, "storage_path", None),
            "mime_type": getattr(u, "mime_type", None),
            "created_at": u.created_at,
        })
    return results


@router.get("/uploads/{upload_id}")
def get_upload_route(upload_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = _resolve_user(db, current_user)
    u = get_upload(db, upload_id=upload_id)
    if u is None or u.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
    return {
        "id": u.id,
        "user_id": u.user_id,
        "chat_id": u.chat_id,
        "file_name": getattr(u, "file_name", None),
        "storage_path": getattr(u, "storage_path", None),
        "mime_type": getattr(u, "mime_type", None),
        "extracted_text": getattr(u, "extracted_text", None),
        "created_at": u.created_at,
    }
