from sqlalchemy.orm import Session
from src.Models.User import User
from src.Schemas.UserSchema import UserCreate, UserLogin
from src.Utils.Security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status

def register_user(db: Session, user: UserCreate):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user_username = db.query(User).filter(User.username == user.username).first()
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def login_user(db: Session, user: UserLogin):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
