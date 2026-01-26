from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from src.Models.Cart import CartItem
from src.Models.User import User
from src.Dependencies import get_current_user
from src.Schemas.CatalogSchema import JerseyResponse
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter()

# Schema for incoming cart item
class CartItemCreate(BaseModel):
    jersey_id: int
    size: str
    quantity: int = 1
    custom_name: Optional[str] = None
    custom_number: Optional[str] = None
    patches: Optional[List[str]] = []
    final_price: float

class CartItemResponse(BaseModel):
    id: int
    jersey_id: int
    jersey: Optional[JerseyResponse] = None
    size: str
    quantity: int
    custom_name: Optional[str]
    custom_number: Optional[str]
    patches: Optional[List[str]]
    final_price: float
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CartItemResponse])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    # Parse patches JSON and ensure jersey is attached
    response_items = []
    for item in items:
        # We need to manually handle the JSON field if we aren't using a custom serializer
        # But we also want to return the full Jersey object.
        # Constructing the dict explicitly is safest given the mixed field types.
        patches_list = []
        if item.patches:
            try:
                patches_list = json.loads(item.patches)
            except:
                patches_list = []
        
        response_items.append({
            "id": item.id,
            "jersey_id": item.jersey_id,
            "jersey": item.jersey, # SQLAlchemy relationship
            "size": item.size,
            "quantity": item.quantity,
            "custom_name": item.custom_name,
            "custom_number": item.custom_number,
            "patches": patches_list,
            "final_price": item.final_price
        })
    return response_items

@router.post("/", response_model=CartItemResponse)
def add_to_cart(item: CartItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if item exists (matching all criteria)
    patches_json = json.dumps(item.patches.sort() if item.patches else [])
    
    # We need to sort incoming patches to match strictly? 
    # Let's simplify: Serialize incoming and compare.
    # Ideally we'd search flexibly, but for exact cart grouping:
    
    # Logic: Search for existing item with same jersey, size, custom fields.
    # Then compare patches.
    # This is complex to do efficiently in SQL with JSON strings.
    # For now, let's just add the item. The user said "store items", granular merging is an optimization.
    # Actually, if we don't merge, we'll have duplicate rows. 
    # Let's try to find it in python.
    
    existing_items = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.jersey_id == item.jersey_id,
        CartItem.size == item.size,
        CartItem.custom_name == item.custom_name,
        CartItem.custom_number == item.custom_number
    ).all()

    target_item = None
    incoming_patches = sorted(item.patches) if item.patches else []
    
    for db_item in existing_items:
        db_patches = []
        if db_item.patches:
            try:
                db_patches = sorted(json.loads(db_item.patches))
            except:
                pass
        
        if db_patches == incoming_patches:
            target_item = db_item
            break
    
    if target_item:
        target_item.quantity += item.quantity
        db.commit()
        db.refresh(target_item)
        target_patches = []
        if target_item.patches:
            try:
                target_patches = json.loads(target_item.patches)
            except:
                pass
                
        return {
            "id": target_item.id,
            "jersey_id": target_item.jersey_id,
            "jersey": target_item.jersey,
            "size": target_item.size,
            "quantity": target_item.quantity,
            "custom_name": target_item.custom_name,
            "custom_number": target_item.custom_number,
            "patches": target_patches,
            "final_price": target_item.final_price
        }
    
    # Create new
    new_item = CartItem(
        user_id=current_user.id,
        jersey_id=item.jersey_id,
        size=item.size,
        quantity=item.quantity,
        custom_name=item.custom_name,
        custom_number=item.custom_number,
        patches=json.dumps(incoming_patches),
        final_price=item.final_price
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Return formatted response
    return {
        "id": new_item.id,
        "jersey_id": new_item.jersey_id,
        "jersey": new_item.jersey,
        "size": new_item.size,
        "quantity": new_item.quantity,
        "custom_name": new_item.custom_name,
        "custom_number": new_item.custom_number,
        "patches": incoming_patches,
        "final_price": new_item.final_price
    }

@router.delete("/{item_id}")
def remove_from_cart(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item removed"}

@router.delete("/")
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
