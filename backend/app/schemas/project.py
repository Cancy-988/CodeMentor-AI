from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    language: str | None = None
    framework: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    language: str | None = None
    framework: str | None = None
    status: str | None = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: str | None = None
    language: str | None = None
    framework: str | None = None
    status: str | None = None
    created_at: datetime
    updated_at: datetime


class ProjectWorkspaceUpsert(BaseModel):
    workspace_json: dict


class ProjectWorkspaceResponse(BaseModel):
    project: ProjectResponse
    workspace_json: dict | None = None
