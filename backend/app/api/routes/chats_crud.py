from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.history import ChatDetailResponse, ChatMessageResponse
from app.schemas.chat import ChatRequest
from app.services.database import create_chat, get_chat, update_chat, delete_chat, list_messages, audit_log

router = APIRouter()


@router.post("/chats", response_model=ChatDetailResponse, status_code=status.HTTP_201_CREATED)
def create_chat_route(request: ChatRequest, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = create_chat(db, user_id=current_user.id, title=request.message[:80] or "New chat", summary=None, source="chat")
    audit_log(db, user_id=current_user.id, action="create_chat", entity_type="chat", entity_id=chat.id)
    db.commit()
    # return chat with empty messages
    return ChatDetailResponse.model_validate({**chat.__dict__, "messages": []})


@router.get("/chats/{chat_id}", response_model=ChatDetailResponse)
def get_chat_route(chat_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = get_chat(db, chat_id=chat_id)
    if chat is None or chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    messages = list_messages(db, chat_id=chat.id)
    return ChatDetailResponse.model_validate({**chat.__dict__, "messages": messages})


@router.patch("/chats/{chat_id}", response_model=ChatDetailResponse)
def update_chat_route(chat_id: int, request: ChatRequest, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = get_chat(db, chat_id=chat_id)
    if chat is None or chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    updated = update_chat(db, chat_id=chat_id, title=request.message[:255])
    audit_log(db, user_id=current_user.id, action="update_chat", entity_type="chat", entity_id=chat_id)
    db.commit()
    messages = list_messages(db, chat_id=chat_id)
    return ChatDetailResponse.model_validate({**updated.__dict__, "messages": messages})


@router.delete("/chats/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_route(chat_id: int, current_user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = get_chat(db, chat_id=chat_id)
    if chat is None or chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    delete_chat(db, chat_id=chat_id)
    audit_log(db, user_id=current_user.id, action="delete_chat", entity_type="chat", entity_id=chat_id)
    db.commit()
    return None
