from sqlalchemy.orm import Session
from src.Models.User import User

def get_all_users(db: Session):
    return db.query(User).all()
