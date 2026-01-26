from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Snapshot of address data or Link. For MVP, we'll store the NIF and link/copy address.
    # To simplify, we'll store the shipping details as text/json or just strict fields if we want.
    # Let's store critical shipping info as a snapshot to avoid issues if User Address is deleted/changed.
    shipping_name = Column(String)
    shipping_address = Column(String)
    shipping_city = Column(String)
    shipping_postal_code = Column(String)
    shipping_country = Column(String)
    shipping_phone = Column(String)
    
    nif = Column(String, nullable=True)
    
    total_amount = Column(Float)
    status = Column(String, default=OrderStatus.PENDING)
    
    payment_method = Column(String)
    payment_details = Column(Text, nullable=True) # JSON for things like MBWay Phone
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    jersey_id = Column(Integer, ForeignKey("jerseys.id"))
    
    size = Column(String)
    quantity = Column(Integer)
    custom_name = Column(String, nullable=True)
    custom_number = Column(String, nullable=True)
    patches = Column(Text, nullable=True) # JSON
    
    price = Column(Float) # Price at moment of purchase
    
    order = relationship("Order", back_populates="items")
    jersey = relationship("Jersey")
