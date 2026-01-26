from sqlalchemy.orm import Session
from src.Models.User import User
from src.Schemas.UserSchema import UserCreate, UserLogin, UserGoogleLogin
from src.Utils.Security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status

def register_user(db: Session, user: UserCreate):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Este Email já está associado a uma conta")
    
    db_user_username = db.query(User).filter(User.username == user.username).first()
    if db_user_username:
        raise HTTPException(status_code=400, detail=" Este Nome de utilizador já existe")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        auth_provider="local"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

from sqlalchemy import or_

def login_user(db: Session, user: UserLogin):
    login_value = user.identifier or user.username or user.email
    
    if not login_value:
        raise HTTPException(status_code=400, detail="Por favor forneça um nome de utilizador ou email")

    db_user = db.query(User).filter(
        or_(
            User.email == login_value,
            User.username == login_value
        )
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Palavra-passe incorreta")
    
    access_token = create_access_token(data={"sub": db_user.email, "username": db_user.username, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer"}

import random
import string

def generate_random_username(name: str):
    # Remove spaces and lower case
    base = name.replace(" ", "").lower()
    # Add 4 random digits
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"{base}{suffix}"

def google_login_user(db: Session, user: UserGoogleLogin):
    # Check if user exists by email
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if db_user:
        # User exists, return token
        # You might want to update google_id if it's missing, but for now just login
        access_token = create_access_token(data={"sub": db_user.email, "username": db_user.username, "role": db_user.role})
        return {"access_token": access_token, "token_type": "bearer"}
    
    # User does not exist, create new one
    # Use provided username or generate one
    new_username = user.username
    if not new_username:
        new_username = generate_random_username(user.first_name)
        # Ensure uniqueness (simple check, could improve with loop)
        while db.query(User).filter(User.username == new_username).first():
             new_username = generate_random_username(user.first_name)
    
    # Create user without password (or un-usable one) since it's google auth
    db_user = User(
        email=user.email,
        username=new_username,
        hashed_password="", # No password for google users
        first_name=user.first_name,
        last_name=user.last_name,
        auth_provider="google",
        google_id=user.google_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": db_user.email, "username": db_user.username, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer"}

from datetime import datetime, timedelta
import secrets
from src.Schemas.UserSchema import UserForgotPassword, UserResetPassword
from src.Utils.EmailService import send_reset_email

async def forgot_password(db: Session, data: UserForgotPassword):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Standard practice: return success even if user not found (to prevent enumeration)
        return {"message": "Se o email existir, receberá um link de recuperação."}
    
    if user.auth_provider == 'google':
         return {"message": "Contas Google não podem recuperar password."}

    # Generate Token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    # Expires in 15 minutes
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=15)
    
    db.commit()
    
    # Send Email
    try:
        await send_reset_email(user.email, token)
    except Exception as e:
        print(f"Failed to send email: {e}")
        # rollback token? No, user can try again.
    
    return {"message": "Email de recuperação enviado!"}

def reset_password(db: Session, data: UserResetPassword):
    user = db.query(User).filter(User.reset_token == data.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")
        
    if user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expirado")
        
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="As palavras-passe não coincidem")
        
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    db.commit()
    return {"message": "Palavra-passe alterada com sucesso!"}
