from fastapi import APIRouter, Depends
import sqlalchemy.orm as orm
import schemas
from services import auth_service, course_service, review_service

router = APIRouter(
    prefix="/lecturer",
    tags=["Lecturer"],
    dependencies=[Depends(auth_service.require_lecturer)]
)

@router.get("/courses", response_model=list[schemas.CourseWithSentiment])
async def get_my_courses(
    user: schemas.UserResponse = Depends(auth_service.get_current_user),
    db: orm.Session = Depends(auth_service.get_db)
):
    """Gets all courses taught by the current lecturer with sentiment data."""
    courses = await course_service.get_lecturer_courses(db, lecturer_id=user.id)
    if not courses:
        return []
    return await course_service.get_courses_with_sentiments(courses, db)

@router.get("/reviews/{course_id}", response_model=list[schemas.LecturerReviewResponse])
async def get_reviews_for_my_course(
    course_id: int,
    user: schemas.UserResponse = Depends(auth_service.get_current_user),
    db: orm.Session = Depends(auth_service.get_db)
):
    return await review_service.get_course_reviews_for_lecturer(db, course_id, user.id)