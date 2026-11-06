from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

users_db = {}

class UserCreate(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str

@router.post("/register/")
async def register(user: UserCreate):
    otp = str(uuid.uuid4())[:6]
    users_db[user.email] = {"otp": otp, "verified": False}
    return {"message": f"OTP envoyé à {user.email}", "otp": otp}

@router.post("/verify/")
async def verify(user: OTPVerify):
    user_data = users_db.get(user.email)
    if not user_data or user_data["otp"] != user.otp:
        raise HTTPException(status_code=400, detail="OTP invalide")
    users_db[user.email]["verified"] = True
    return {"message": "Utilisateur vérifié"}
