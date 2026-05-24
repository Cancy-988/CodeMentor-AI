from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(OrmModel):
    id: int
    supabase_user_id: str
    email: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    auth_provider: str
    created_at: datetime
    updated_at: datetime


class ChatSummaryResponse(OrmModel):
    id: int
    title: str
    summary: str | None = None
    language: str | None = None
    framework: str | None = None
    source: str
    created_at: datetime
    updated_at: datetime


class ChatMessageResponse(OrmModel):
    id: int
    chat_id: int
    role: str
    content: str
    metadata_json: dict | None = None
    created_at: datetime


class ChatDetailResponse(OrmModel):
    id: int
    title: str
    summary: str | None = None
    language: str | None = None
    framework: str | None = None
    source: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageResponse]


class ReviewHistoryResponse(OrmModel):
    id: int
    chat_id: int | None = None
    language: str
    code: str
    result_json: dict
    created_at: datetime


class UploadHistoryResponse(OrmModel):
    id: int
    chat_id: int | None = None
    filename: str
    language: str
    content: str
    file_type: str
    mime_type: str | None = None
    storage_path: str | None = None
    extracted_text: str | None = None
    created_at: datetime


class MemoryResponse(OrmModel):
    id: int
    key: str
    value_json: dict
    created_at: datetime
    updated_at: datetime