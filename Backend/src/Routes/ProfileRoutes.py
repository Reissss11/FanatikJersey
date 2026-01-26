from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from src.Dependencies import get_current_user
from src.Models.User import User
from src.Models.User import User
from src.Schemas.ProfileSchema import ProfileResponse, AddressCreate, AddressResponse, UserUpdateInfo, UserImageCreate, UserImageResponse, PasswordChange
from src.Controllers.ProfileController import get_user_profile, update_user_info, add_address, update_address, delete_address, upload_image, change_password

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_profile(db, current_user.id)

@router.put("/me/info", response_model=ProfileResponse)
def update_info(info: UserUpdateInfo, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_user_info(db, current_user.id, info)

@router.put("/me/password")
def update_password(password_data: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return change_password(db, current_user.id, password_data)

@router.post("/me/image", response_model=UserImageResponse)
def upload_user_image(image: UserImageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return upload_image(db, current_user.id, image.image_data)

@router.post("/me/address", response_model=AddressResponse)
def create_address(address: AddressCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return add_address(db, current_user.id, address)

@router.put("/me/address/{address_id}", response_model=AddressResponse)
def edit_address(address_id: int, address: AddressCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_address(db, current_user.id, address_id, address)

@router.delete("/me/address/{address_id}")
def remove_address(address_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return delete_address(db, current_user.id, address_id)
