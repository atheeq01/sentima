
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
from routers import auth, admin, student, lecturer

# create all database tables
database.create_database()

app = FastAPI(
    title="Student Feedback and Sentiment Analysis API",
    description="An API for managing student feedback on university courses.",
    version="1.1.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000:80","https://sentima.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(lecturer.router)
app.include_router(student.router)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Student Feedback API!"}