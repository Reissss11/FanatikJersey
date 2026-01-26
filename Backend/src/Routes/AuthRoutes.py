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

from src.Schemas.UserSchema import UserForgotPassword, UserResetPassword
from src.Controllers.AuthController import forgot_password, reset_password

@router.post("/forgot-password")
async def forgot_pwd(data: UserForgotPassword, db: Session = Depends(get_db)):
    return await forgot_password(db, data)

@router.post("/reset-password")
def reset_pwd(data: UserResetPassword, db: Session = Depends(get_db)):
    return reset_password(db, data)
