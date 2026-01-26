from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from src.Schemas.UserSchema import UserCreate, UserLogin, UserResponse, Token, UserGoogleLogin
from src.Controllers.AuthController import register_user, login_user, google_login_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user)

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, user)

@router.post("/google-login", response_model=Token)
def google_login(user: UserGoogleLogin, db: Session = Depends(get_db)):
    return google_login_user(db, user)
