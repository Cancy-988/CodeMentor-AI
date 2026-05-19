from fastapi import APIRouter, HTTPException

from app.schemas.review import CodeReviewRequest, CodeReviewResponse
from app.services.gemini import generate_code_review

router = APIRouter()


@router.post("/review-code", response_model=CodeReviewResponse)
def review_code(request: CodeReviewRequest):
    try:
        review = generate_code_review(request.code, request.language)
        return CodeReviewResponse.model_validate(review)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an invalid review payload. Please retry or adjust the prompt/model.",
        ) from error