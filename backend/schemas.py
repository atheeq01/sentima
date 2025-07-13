from pydantic import BaseModel
import datetime
from typing import Optional
from models import UserRole



# ---------- User Schemas ----------
class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    student_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    student_id: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class StudentRegister(BaseModel):
    name: str
    email: str
    password: str
    student_id: str

    class Config:
        from_attributes = True


# ---------- Course Schemas ----------
class CourseBase(BaseModel):
    title: str
    code: str

class CourseCreate(CourseBase):
    lecturer_id: int

class CourseResponse(CourseBase):
    id: int
    lecturer_id: int

    class Config:
        from_attributes = True


# ----- Review Schemas -----
class ReviewBase(BaseModel):
    text: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    student_id: int
    course_id: int  # Essential for the frontend
    student_name: str
    course_title: str
    sentiment: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class LecturerReviewResponse(BaseModel):
    id: int
    text: str
    sentiment: str

    class Config:
        from_attributes = True

# ----- Sentiment & Overview Schemas -----
class SentimentDistribution(BaseModel):
    positive: float
    negative: float
    neutral: float

class SentimentSummary(BaseModel):
    course_id: int
    positive: int
    negative: int
    neutral: int
    total: int
    sentiment_distribution: SentimentDistribution

class CourseWithSentiment(CourseResponse):
    positive: int
    negative: int
    neutral: int
    total: int
    positive_percent: float
    negative_percent: float
    neutral_percent: float

class AdminOverview(BaseModel):
    total_courses: int
    total_reviews: int
    total_students: int
    total_lecturers: int
    sentiment_distribution: SentimentDistribution