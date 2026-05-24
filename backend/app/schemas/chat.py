from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    reply: str


class MessageCreate(BaseModel):
    role: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    metadata_json: dict | None = None


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    metadata_json: dict | None = None
    created_at: str
