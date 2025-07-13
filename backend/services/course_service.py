import sqlalchemy.orm as orm
from fastapi import HTTPException, status
import models, schemas


async def create_course(course: schemas.CourseCreate, db: orm.Session):
    lecturer = db.query(models.User).get(course.lecturer_id)
    if not lecturer or lecturer.role != models.UserRole.lecturer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lecturer ID")

    if db.query(models.CourseUnit).filter(models.CourseUnit.code == course.code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Course code '{course.code}' already exists")

    course_obj = models.CourseUnit(**course.model_dump())
    db.add(course_obj)
    db.commit()
    db.refresh(course_obj)
    return course_obj


async def update_course(db: orm.Session, course_id: int, course_data: schemas.CourseCreate):
    course = db.query(models.CourseUnit).get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    lecturer = db.query(models.User).get(course_data.lecturer_id)
    if not lecturer or lecturer.role != models.UserRole.lecturer:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lecturer ID")

    update_data = course_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)
    return course


async def get_all_courses(db: orm.Session):
    return db.query(models.CourseUnit).all()


async def get_lecturer_courses(db: orm.Session, lecturer_id: int):
    return db.query(models.CourseUnit).filter(models.CourseUnit.lecturer_id == lecturer_id).all()


async def delete_course(db: orm.Session, course_id: int):
    course = db.query(models.CourseUnit).get(course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    db.delete(course)
    db.commit()


async def get_courses_with_sentiments(courses: list[models.CourseUnit], db: orm.Session):
    course_ids = [course.id for course in courses]
    reviews = db.query(models.Review).filter(models.Review.course_id.in_(course_ids)).all()

    sentiment_map = {cid: {"positive": 0, "negative": 0, "neutral": 0, "total": 0} for cid in course_ids}
    for review in reviews:
        sentiment_map[review.course_id][review.sentiment] += 1
        sentiment_map[review.course_id]["total"] += 1

    enriched_courses = []
    for course in courses:
        stats = sentiment_map[course.id]
        total = stats["total"]
        enriched_courses.append({
            "id": course.id, "title": course.title, "code": course.code, "lecturer_id": course.lecturer_id,
            "positive": stats["positive"], "negative": stats["negative"], "neutral": stats["neutral"], "total": total,
            "positive_percent": (stats["positive"] / total) * 100 if total else 0.0,
            "negative_percent": (stats["negative"] / total) * 100 if total else 0.0,
            "neutral_percent": (stats["neutral"] / total) * 100 if total else 0.0,
        })
    return enriched_courses