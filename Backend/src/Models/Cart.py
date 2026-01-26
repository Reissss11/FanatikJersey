from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    jersey_id = Column(Integer, ForeignKey("jerseys.id"))
    size = Column(String)
    quantity = Column(Integer, default=1)
    custom_name = Column(String, nullable=True)
    custom_number = Column(String, nullable=True)
    patches = Column(Text, nullable=True) # Stored as JSON string
    final_price = Column(Float)

    # Relationships
    user = relationship("User", back_populates="cart_items")
    jersey = relationship("Jersey") 
