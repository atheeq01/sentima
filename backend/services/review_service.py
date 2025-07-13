import sqlalchemy.orm as orm
from fastapi import HTTPException, status
import models, schemas, ml_util


def _to_review_response(review: models.Review) -> schemas.ReviewResponse:

    return schemas.ReviewResponse(
        id=review.id,
        student_id=review.student_id,
        course_id=review.course_id,
        student_name=review.author.name if review.author else "N/A",
        course_title=review.course.title if review.course else "N/A",
        text=review.text,
        sentiment=review.sentiment,
        created_at=review.created_at
    )


async def create_review(db: orm.Session, review_data: schemas.ReviewCreate, student_id: int, course_id: int):
    if db.query(models.Review).filter_by(student_id=student_id, course_id=course_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this course.")

    result = ml_util.predict_sentiment(review_data.text)
    review_obj = models.Review(
        student_id=student_id, course_id=course_id, text=review_data.text,
        clean_text=result['lemmatize'], sentiment=result['sentiment']
    )
    db.add(review_obj)
    db.commit()
    db.refresh(review_obj)
    db.expire(review_obj)  # Expire to trigger a refresh with relationships

    # Re-fetch with relationships loaded for the response
    final_review = db.query(models.Review).options(
        orm.joinedload(models.Review.author),
        orm.joinedload(models.Review.course)
    ).get(review_obj.id)

    return _to_review_response(final_review)


async def delete_review(db: orm.Session, review_id: int):
    review = db.query(models.Review).get(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()


async def get_all_reviews(db: orm.Session):
    reviews = db.query(models.Review).options(
        orm.joinedload(models.Review.author),
        orm.joinedload(models.Review.course)
    ).all()
    return [_to_review_response(r) for r in reviews]


async def get_reviews_by_student(db: orm.Session, student_id: int):
    reviews = db.query(models.Review).filter_by(student_id=student_id).options(
        orm.joinedload(models.Review.author),
        orm.joinedload(models.Review.course)
    ).all()
    return [_to_review_response(r) for r in reviews]


async def get_course_reviews_for_lecturer(db: orm.Session, course_id: int, lecturer_id: int):
    course = db.query(models.CourseUnit).filter_by(id=course_id, lecturer_id=lecturer_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to view reviews for this course")

    reviews = db.query(models.Review).filter_by(course_id=course_id).all()
    return [schemas.LecturerReviewResponse.from_orm(r) for r in reviews]