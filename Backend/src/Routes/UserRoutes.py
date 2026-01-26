from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from src.Schemas.UserSchema import UserResponse
from src.Controllers.UserController import get_all_users
from typing import List

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return get_all_users(db)
