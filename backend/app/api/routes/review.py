from fastapi import APIRouter, HTTPException

from app.schemas.review import CodeReviewRequest, CodeReviewResponse
from app.agents.workflow import run_review_workflow

router = APIRouter()


@router.post("/review-code", response_model=CodeReviewResponse)
def review_code(request: CodeReviewRequest):
    try:
        review = run_review_workflow(request.code, request.language)
        return CodeReviewResponse.model_validate(review)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="The multi-agent review pipeline failed. Please retry or adjust the prompt/model.",
        ) from error