import jwt
import sqlalchemy.orm as orm
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.hash import bcrypt
import database, models, schemas, config
from services import user_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def register_student(user_data: schemas.StudentRegister, db: orm.Session):
    if await user_service.get_user_by_email(user_data.email, db):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_obj = models.User(
        student_id=user_data.student_id,
        name=user_data.name,
        email=user_data.email,
        hashed_password=bcrypt.hash(user_data.password),
        role=models.UserRole.student
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

async def authenticate_user(email: str, password: str, db: orm.Session):
    user = await user_service.get_user_by_email(email=email, db=db)
    if not user or not user.verify_password(password):
        return None
    return user

async def create_token(user: models.User):
    user_data = schemas.UserResponse.from_orm(user).model_dump()
    token = jwt.encode(user_data, config.JWT_SECRET, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme), db: orm.Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        if user_id is None:
            raise credentials_exception
        user = db.query(models.User).get(user_id)
        if user is None:
            raise credentials_exception
        return schemas.UserResponse.from_orm(user)
    except jwt.PyJWTError:
        raise credentials_exception

# --- Role-based access control dependencies ---
def require_role(role: models.UserRole):
    async def role_checker(user: schemas.UserResponse = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"{role.value.capitalize()} access required.")
        return user
    return role_checker

require_admin = require_role(models.UserRole.admin)
require_lecturer = require_role(models.UserRole.lecturer)
require_student = require_role(models.UserRole.student)