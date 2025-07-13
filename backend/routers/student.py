from fastapi import APIRouter, Depends, HTTPException, status
import sqlalchemy.orm as orm
import schemas, ml_util
from services import auth_service, course_service, review_service

router = APIRouter(
    prefix="/student",
    tags=["Student"],
    dependencies=[Depends(auth_service.require_student)]
)

@router.get("/courses", response_model=list[schemas.CourseWithSentiment])
async def get_all_courses_for_student_view(db: orm.Session = Depends(auth_service.get_db)):
    """Gets all available courses with sentiment data for the student dashboard."""
    courses = await course_service.get_all_courses(db)
    return await course_service.get_courses_with_sentiments(courses, db)

@router.post("/course/{course_id}/submit", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review_for_course(
    course_id: int,
    review_data: schemas.ReviewCreate,
    user: schemas.UserResponse = Depends(auth_service.get_current_user),
    db: orm.Session = Depends(auth_service.get_db),
):
    """Submits a new review for a course."""
    return await review_service.create_review(db, review_data, user.id, course_id)

@router.post("/predict-sentiment")
async def predict_sentiment_for_text(review_text: schemas.ReviewCreate):
    """Provides a live sentiment prediction for a given text."""
    if not review_text.text or not review_text.text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty")
    result = ml_util.predict_sentiment(review_text.text)
    return {"sentiment": result['sentiment']}

@router.get("/my-reviews", response_model=list[schemas.ReviewResponse])
async def get_my_submitted_reviews(
    user: schemas.UserResponse = Depends(auth_service.get_current_user),
    db: orm.Session = Depends(auth_service.get_db)
):
    return await review_service.get_reviews_by_student(db, student_id=user.id)