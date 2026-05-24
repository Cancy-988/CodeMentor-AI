from pydantic import BaseModel, EmailStr


class AuthUser(BaseModel):
    id: str
    email: EmailStr | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    role: str | None = None
    aud: str | None = None


class AuthMeResponse(BaseModel):
    user: AuthUser