from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Address Schemas
class AddressBase(BaseModel):
    first_name: str
    last_name: str
    country: str
    street_address: str
    district: str
    city: str
    postal_code: str
    phone_number: str
    email: EmailStr

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# User Image Schemas
class UserImageCreate(BaseModel):
    image_data: str # Base64 string

class UserImageResponse(UserImageCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# User Update Info Schema
class UserUpdateInfo(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    username: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

# Full Profile Response
class ProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    addresses: List[AddressResponse] = []
    user_images: List[UserImageResponse] = [] 

    class Config:
        from_attributes = True
