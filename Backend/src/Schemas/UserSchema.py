from pydantic import BaseModel, EmailStr, field_validator
import re

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    first_name: str
    last_name: str
    password: str

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('A palavra-passe deve ter pelo menos 6 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('A palavra-passe deve conter pelo menos uma letra maiúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('A palavra-passe deve conter pelo menos uma letra minúscula')
        if not re.search(r'\d', v):
            raise ValueError('A palavra-passe deve conter pelo menos um número')
        return v

from typing import Optional

class UserLogin(BaseModel):
    identifier: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class UserResponse(UserBase):
    id: int
    username: str
    is_active: bool
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    auth_provider: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserForgotPassword(BaseModel):
    email: EmailStr

class UserResetPassword(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class UserGoogleLogin(BaseModel):
    email: EmailStr
    google_id: str
    first_name: str
    last_name: str
    username: Optional[str] = None
