from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.upload import CodeUploadResponse
from app.services.upload_parser import validate_uploaded_code

router = APIRouter()


@router.post("/upload-code", response_model=CodeUploadResponse)
async def upload_code(file: UploadFile = File(...)):
    try:
        raw_content = await file.read()
        content = raw_content.decode("utf-8")
        language, normalized_content = validate_uploaded_code(file.filename or "", content)
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
