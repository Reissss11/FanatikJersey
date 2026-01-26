from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from src.Models.Order import Order, OrderItem, OrderStatus
from src.Models.Cart import CartItem
from src.Models.User import User
from src.Dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter()

class OrderCreate(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_country: str
    shipping_phone: str
    nif: Optional[str] = None
    payment_method: str
    payment_details: Optional[str] = None # JSON string or specific fields

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Get Cart Items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Calculate Total
    total_amount = sum(item.final_price * item.quantity for item in cart_items)

    # 3. Create Order
    new_order = Order(
        user_id=current_user.id,
        shipping_name=order_data.shipping_name,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_postal_code=order_data.shipping_postal_code,
        shipping_country=order_data.shipping_country,
        shipping_phone=order_data.shipping_phone,
        nif=order_data.nif,
        total_amount=total_amount,
        status=OrderStatus.PENDING,
        payment_method=order_data.payment_method,
        payment_details=order_data.payment_details
    )
    db.add(new_order)
    db.flush() # Flush to get order ID

    # 4. Create Order Items
    for item in cart_items:
        order_item = OrderItem(
            order_id=new_order.id,
            jersey_id=item.jersey_id,
            size=item.size,
            quantity=item.quantity,
            custom_name=item.custom_name,
            custom_number=item.custom_number,
            patches=item.patches,
            price=item.final_price
        )
        db.add(order_item)

    # 5. Clear Cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    # 6. Commit
    db.commit()
    db.refresh(new_order)

    return {"message": "Order placed successfully", "order_id": new_order.id}

@router.get("/", response_model=List[dict]) # Simple response for now
def get_user_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [
        {
            "id": o.id,
            "date": o.created_at,
            "status": o.status,
            "total": o.total_amount,
            "payment_method": o.payment_method
        } for o in orders
    ]
