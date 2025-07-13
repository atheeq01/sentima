import sqlalchemy.orm as orm
from fastapi import HTTPException, status
from passlib.hash import bcrypt
import models, schemas


async def get_user_by_email(email: str, db: orm.Session):
    return db.query(models.User).filter(models.User.email == email).first()


async def create_admin_user(user_data: schemas.UserCreate, db: orm.Session):
    if await get_user_by_email(user_data.email, db):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    if user_data.role == models.UserRole.student and not user_data.student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student ID is required for student role")

    user_obj = models.User(
        student_id=user_data.student_id if user_data.role == models.UserRole.student else None,
        name=user_data.name,
        email=user_data.email,
        hashed_password=bcrypt.hash(user_data.password),
        role=user_data.role
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj


async def get_all_users(db: orm.Session):
    """Fetches all users from the database."""
    return db.query(models.User).all()


async def get_all_lecturers(db: orm.Session):
    return db.query(models.User).filter(models.User.role == models.UserRole.lecturer).all()


async def delete_user(db: orm.Session, user_id: int):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == models.UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete an admin user")
    db.delete(user)
    db.commit()


async def update_user(db: orm.Session, user_id: int, user_data: schemas.UserUpdate):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != user.email:
        if await get_user_by_email(update_data["email"], db):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    if "password" in update_data and update_data["password"]:
        user.hashed_password = bcrypt.hash(update_data["password"])

    # Update other fields, excluding password
    for key, value in update_data.items():
        if key != "password":
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user