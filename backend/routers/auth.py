from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import sqlalchemy.orm as orm

import schemas
from services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token")
async def generate_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: orm.Session = Depends(auth_service.get_db)
):
    """Provides a token for a valid username (email) and password."""
    user = await auth_service.authenticate_user(email=form_data.username, password=form_data.password, db=db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return await auth_service.create_token(user)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_student_and_get_token(
    user_data: schemas.StudentRegister,
    db: orm.Session = Depends(auth_service.get_db)
):
    """Registers a new student and returns a token."""
    user_obj = await auth_service.register_student(user_data, db)
    return await auth_service.create_token(user_obj)

@router.get("/user/me", response_model=schemas.UserResponse)
async def get_my_user_data(user: schemas.UserResponse = Depends(auth_service.get_current_user)):
    """Returns the data for the currently authenticated user."""
    return user