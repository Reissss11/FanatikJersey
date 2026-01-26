from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class UserImage(Base):
    __tablename__ = "user_images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Storing as base64 string for simplicity as requested/planned
    image_data = Column(Text) 

    user = relationship("User", back_populates="user_images")
