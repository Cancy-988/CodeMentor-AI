from pydantic import BaseModel, Field


class MemoryUpsert(BaseModel):
    key: str = Field(..., min_length=1, max_length=120)
    value_json: dict


class MemoryResponse(BaseModel):
    id: int
    key: str
    value_json: dict
    created_at: str
    updated_at: str
