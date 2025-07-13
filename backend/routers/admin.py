from fastapi import APIRouter, Depends, status
import sqlalchemy.orm as orm
import schemas
from services import auth_service, user_service, course_service, review_service, overview_service

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(auth_service.require_admin)]
)

# --- Overview ---
@router.get("/overview", response_model=schemas.AdminOverview)
async def get_system_overview(db: orm.Session = Depends(auth_service.get_db)):
    return await overview_service.get_admin_overview(db)

# --- User Management ---
@router.get("/users", response_model=list[schemas.UserResponse])
async def list_all_users(db: orm.Session = Depends(auth_service.get_db)):
    return await user_service.get_all_users(db)

@router.get("/users/lecturers", response_model=list[schemas.UserResponse])
async def list_all_lecturers(db: orm.Session = Depends(auth_service.get_db)):
    return await user_service.get_all_lecturers(db)

@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: schemas.UserCreate, db: orm.Session = Depends(auth_service.get_db)):
    return await user_service.create_admin_user(user_data, db)

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(user_id: int, user_data: schemas.UserUpdate, db: orm.Session = Depends(auth_service.get_db)):
    return await user_service.update_user(db, user_id, user_data)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: orm.Session = Depends(auth_service.get_db)):
    await user_service.delete_user(db, user_id)

# --- Course Management ---
@router.get("/courses", response_model=list[schemas.CourseWithSentiment])
async def list_courses(db: orm.Session = Depends(auth_service.get_db)):
    courses = await course_service.get_all_courses(db)
    return await course_service.get_courses_with_sentiments(courses, db)

@router.post("/courses", response_model=schemas.CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(course_data: schemas.CourseCreate, db: orm.Session = Depends(auth_service.get_db)):
    return await course_service.create_course(course_data, db)

@router.put("/courses/{course_id}", response_model=schemas.CourseResponse)
async def update_course(course_id: int, course_data: schemas.CourseCreate, db: orm.Session = Depends(auth_service.get_db)):
    return await course_service.update_course(db, course_id, course_data)

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: int, db: orm.Session = Depends(auth_service.get_db)):
    await course_service.delete_course(db=db, course_id=course_id)

# --- Review Management ---
@router.get("/reviews", response_model=list[schemas.ReviewResponse])
async def list_reviews(db: orm.Session = Depends(auth_service.get_db)):
    return await review_service.get_all_reviews(db)

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: int, db: orm.Session = Depends(auth_service.get_db)):
    await review_service.delete_review(db, review_id)