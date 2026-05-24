from fastapi import Header, HTTPException, status
import jwt
from supabase import Client, create_client

from app.core.config import settings
from app.schemas.auth import AuthUser

_supabase_client: Client | None = None


def _get_supabase_client() -> Client:
    global _supabase_client

    if _supabase_client is not None:
      return _supabase_client

    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_URL is not configured.",
        )

    if not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_ANON_KEY is not configured.",
        )

    _supabase_client = create_client(settings.supabase_url, settings.supabase_anon_key)
    return _supabase_client


def _fetch_supabase_user(token: str):
    try:
        client = _get_supabase_client()
        response = client.auth.get_user(token)
        user = getattr(response, "user", None)
        if user is None and isinstance(response, dict):
            user = response.get("user")

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Supabase access token.")

        return user
    except Exception:
        try:
            claims = jwt.decode(token, options={"verify_signature": False, "verify_aud": False})
        except Exception as error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Supabase access token: {str(error)}",
            ) from error

        return claims


def _get_claim_value(claims: dict, key: str):
    value = claims.get(key)
    if value is not None:
        return value

    user_metadata = claims.get("user_metadata") or {}
    app_metadata = claims.get("app_metadata") or {}

    if key == "full_name":
        return user_metadata.get("full_name") or user_metadata.get("name")
    if key == "avatar_url":
        return user_metadata.get("avatar_url") or user_metadata.get("picture")
    if key == "role":
        return app_metadata.get("role")

    return None


def get_bearer_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header is required.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token is required.")

    return token.strip()


def get_current_user(authorization: str | None = Header(default=None)) -> AuthUser:
    token = get_bearer_token(authorization)
    user = _fetch_supabase_user(token)

    if isinstance(user, dict):
        user_id = user.get("sub") or user.get("id")
        email = user.get("email")
        full_name = _get_claim_value(user, "full_name")
        avatar_url = _get_claim_value(user, "avatar_url")
        role = _get_claim_value(user, "role")
        aud = user.get("aud")
    else:
        user_metadata = getattr(user, "user_metadata", None) or {}
        app_metadata = getattr(user, "app_metadata", None) or {}

        user_id = getattr(user, "id", None)
        email = getattr(user, "email", None)
        full_name = user_metadata.get("full_name") or user_metadata.get("name")
        avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")
        role = app_metadata.get("role") or getattr(user, "role", None)
        aud = getattr(user, "aud", None)

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is missing a user id.")

    return AuthUser(
        id=str(user_id),
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
        role=role,
        aud=aud,
    )


def get_optional_current_user(authorization: str | None = Header(default=None)) -> AuthUser | None:
    if not authorization:
        return None

    return get_current_user(authorization)