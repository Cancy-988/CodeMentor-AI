from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini import generate_gemini_reply

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        reply = generate_gemini_reply(request.message)
        return ChatResponse(reply=reply)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
