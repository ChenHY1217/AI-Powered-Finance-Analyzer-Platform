# backend/app/schemas/transaction.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    amount: float = Field(..., description="Transaction value, negative represents income, positive represents spending")
    merchant: str = Field(..., max_length=255)
    category: Optional[str] = "Uncategorized"
    timestamp: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True