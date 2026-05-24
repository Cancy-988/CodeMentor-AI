from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_optional_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.database import add_chat_message, create_chat, upsert_user
from app.services.gemini import generate_gemini_reply

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, current_user: AuthUser | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    try:
        reply = generate_gemini_reply(request.message)

        if current_user is not None:
            user = upsert_user(
                db,
                supabase_user_id=current_user.id,
                email=current_user.email,
                full_name=None,
                avatar_url=None,
                auth_provider="google",
            )
            chat = create_chat(db, user_id=user.id, title=request.message[:80] or "New chat", summary=reply[:200], source="chat")
            add_chat_message(db, chat_id=chat.id, role="user", content=request.message)
            add_chat_message(db, chat_id=chat.id, role="assistant", content=reply)
            db.commit()

        return ChatResponse(reply=reply)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
