from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.chat import MessageCreate, MessageResponse
from app.services.database import add_chat_message, list_messages, audit_log

router = APIRouter()


@router.post("/chats/{chat_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(chat_id: int, request: MessageCreate, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    message = add_chat_message(db, chat_id=chat_id, role=request.role, content=request.content, metadata_json=request.metadata_json)
    audit_log(db, user_id=current_user.id, action="create_message", entity_type="message", entity_id=message.id, metadata={"chat_id": chat_id})
    db.commit()
    return message


@router.get("/chats/{chat_id}/messages", response_model=list[MessageResponse])
def get_messages(chat_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = list_messages(db, chat_id=chat_id)
    return messages
