from sqlalchemy.orm import Session
from src.Models.User import User
from src.Models.Address import Address
from src.Models.UserImage import UserImage
from src.Schemas.ProfileSchema import AddressCreate, UserUpdateInfo, UserImageCreate
from fastapi import HTTPException, status

def get_user_profile(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_info(db: Session, user_id: int, info: UserUpdateInfo):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.first_name = info.first_name
    user.last_name = info.last_name
    user.email = info.email
    user.username = info.username
    
    db.commit()
    db.refresh(user)
    return user

def change_password(db: Session, user_id: int, password_data: any):
    from src.Utils.Security import verify_password, get_password_hash
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.auth_provider == 'google':
         raise HTTPException(status_code=400, detail="Utilizadores Google não podem alterar a palavra-passe")

    if not verify_password(password_data.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Palavra-passe atual incorreta")
    
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(status_code=400, detail="As novas palavras-passe não coincidem")
        
    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Palavra-passe alterada com sucesso"}

# Address Management
def add_address(db: Session, user_id: int, address: AddressCreate):
    # Check limit
    count = db.query(Address).filter(Address.user_id == user_id).count()
    if count >= 3:
        raise HTTPException(status_code=400, detail="Limite de 3 moradas atingido")
    
    new_address = Address(
        user_id=user_id,
        first_name=address.first_name,
        last_name=address.last_name,
        country=address.country,
        street_address=address.street_address,
        district=address.district,
        city=address.city,
        postal_code=address.postal_code,
        phone_number=address.phone_number,
        email=address.email
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

def update_address(db: Session, user_id: int, address_id: int, address: AddressCreate):
    db_address = db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()
    if not db_address:
        raise HTTPException(status_code=404, detail="Morada não encontrada")
    
    for key, value in address.model_dump().items():
        setattr(db_address, key, value)
    
    db.commit()
    db.refresh(db_address)
    return db_address

def delete_address(db: Session, user_id: int, address_id: int):
    db_address = db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()
    if not db_address:
        raise HTTPException(status_code=404, detail="Morada não encontrada")
    
    db.delete(db_address)
    db.commit()
    return {"message": "Morada eliminada com sucesso"}

# Image Management
def upload_image(db: Session, user_id: int, image_data: str):
    # Optional: Delete previous image if exists (assuming 1 profile image based on context, though table supports multiple if needed)
    # user.user_images is a list. For now, let's append. Or clear and set new if it's meant to be THE profile pic.
    # Request said "guardar imagens" (plural possible), but usually profile has one. I'll just add for now.
    
    new_image = UserImage(user_id=user_id, image_data=image_data)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image
