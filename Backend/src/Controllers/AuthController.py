from sqlalchemy.orm import Session
from src.Models.User import User
from src.Schemas.UserSchema import UserCreate, UserLogin
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
    db_user = User(email=user.email, username=user.username, hashed_password=hashed_password)
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
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
