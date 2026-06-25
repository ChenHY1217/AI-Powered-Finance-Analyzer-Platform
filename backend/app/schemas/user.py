# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserAuthBase(BaseModel):
    email: EmailStr

class UserRegister(UserAuthBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str