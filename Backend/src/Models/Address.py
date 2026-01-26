from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    first_name = Column(String)
    last_name = Column(String)
    country = Column(String)
    street_address = Column(String)
    district = Column(String)
    city = Column(String)
    postal_code = Column(String)
    phone_number = Column(String)
    email = Column(String)

    user = relationship("User", back_populates="addresses")
