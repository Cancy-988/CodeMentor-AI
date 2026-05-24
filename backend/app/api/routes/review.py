from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_optional_current_user
from app.db.session import get_db
from app.schemas.auth import AuthUser
from app.schemas.review import CodeReviewRequest, CodeReviewResponse
from app.services.database import create_chat, save_review, upsert_user
from app.agents.workflow import run_review_workflow

router = APIRouter()


@router.post("/review-code", response_model=CodeReviewResponse)
def review_code(request: CodeReviewRequest, current_user: AuthUser | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    try:
        review = run_review_workflow(request.code, request.language)

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
                title=f"{request.language.title()} review",
                summary=review.get("final_summary") or review.get("summary") or "AI code review",
                language=request.language,
                source="review",
            )
            save_review(db, user_id=user.id, chat_id=chat.id, language=request.language, code=request.code, result_json=review)
            db.commit()

        return CodeReviewResponse.model_validate(review)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail="The multi-agent review pipeline failed. Please retry or adjust the prompt/model.",
        ) from error