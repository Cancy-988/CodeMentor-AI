from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.history import ChatSummaryResponse, MemoryResponse, ReviewHistoryResponse, UploadHistoryResponse, UserProfileResponse
from app.db.models import ChatThread, CodeReviewRecord, MemoryRecord, UploadRecord, UserAccount

router = APIRouter()


@router.get("/profile/me", response_model=UserProfileResponse)
def get_profile(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.supabase_user_id == current_user.id).one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return user


@router.get("/chats", response_model=list[ChatSummaryResponse])
def list_chats(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.supabase_user_id == current_user.id).one_or_none()
    if user is None:
        return []

    chats = db.query(ChatThread).filter(ChatThread.user_id == user.id).order_by(ChatThread.created_at.desc()).all()
    return chats


@router.get("/reviews", response_model=list[ReviewHistoryResponse])
def list_reviews(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.supabase_user_id == current_user.id).one_or_none()
    if user is None:
        return []

    reviews = db.query(CodeReviewRecord).filter(CodeReviewRecord.user_id == user.id).order_by(CodeReviewRecord.created_at.desc()).all()
    return reviews


@router.get("/uploads", response_model=list[UploadHistoryResponse])
def list_uploads(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.supabase_user_id == current_user.id).one_or_none()
    if user is None:
        return []

    uploads = db.query(UploadRecord).filter(UploadRecord.user_id == user.id).order_by(UploadRecord.created_at.desc()).all()
    return uploads


@router.get("/memories", response_model=list[MemoryResponse])
def list_memories(current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.supabase_user_id == current_user.id).one_or_none()
    if user is None:
        return []

    memories = db.query(MemoryRecord).filter(MemoryRecord.user_id == user.id).order_by(MemoryRecord.updated_at.desc()).all()
    return memories