from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

DATABASE_URL = 'sqlite:///database.db'

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_database():
    Base.metadata.create_all(bind=engine)