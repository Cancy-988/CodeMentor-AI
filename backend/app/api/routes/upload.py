from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import get_optional_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.upload import CodeUploadResponse
from app.services.database import create_chat, save_upload, upsert_user
from app.services.upload_parser import validate_uploaded_code

router = APIRouter()


@router.post("/upload-code", response_model=CodeUploadResponse)
async def upload_code(file: UploadFile = File(...), current_user: AuthUser | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    try:
        raw_content = await file.read()
        content = raw_content.decode("utf-8")
        language, normalized_content = validate_uploaded_code(file.filename or "", content)

        if current_user is not None:
            user = upsert_user(
                db,
                supabase_user_id=current_user.id,
                email=current_user.email,
                full_name=None,
                avatar_url=None,
                auth_provider="google",
            )
            chat = create_chat(
                db,
                user_id=user.id,
                title=file.filename or "Uploaded code",
                summary=f"Uploaded {language} file",
                language=language,
                source="upload",
            )
            save_upload(
                db,
                user_id=user.id,
                chat_id=chat.id,
                filename=file.filename or "uploaded-code",
                language=language,
                content=normalized_content,
                mime_type=file.content_type,
            )
            db.commit()

        return CodeUploadResponse(
            filename=file.filename or "uploaded-code",
            language=language,
            content=normalized_content,
        )
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail="Uploaded file must be UTF-8 text.") from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="Failed to read the uploaded file.") from error
