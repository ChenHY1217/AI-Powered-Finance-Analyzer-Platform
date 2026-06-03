# backend/app/api/v1/transactions.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse
from app.services.ingestion import IngestionService

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])

"""
This module defines the API endpoints for handling transaction-related operations, including uploading transaction data from CSV files and retrieving user transactions. The endpoints are designed to be asynchronous for improved performance and scalability.
"""

# Endpoint to upload transactions via CSV file. The file is processed and stored in the database, returning the created transaction records. In a production environment, user authentication would be required to associate transactions with the correct user.
@router.post("/upload", response_model=list[TransactionResponse], status_code=status.HTTP_201_CREATED)
async def upload_transactions_file(
    user_id: int,  # Temporary query parameter until we inject Auth services next
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file extensions. Only .csv supported.")

    # Process and convert file stream into standard schemas
    parsed_records = IngestionService.parse_csv(file)
    
    db_transactions = []
    for record in parsed_records:
        obj = Transaction(
            user_id=user_id,
            amount=record.amount,
            merchant=record.merchant,
            category=record.category,
            timestamp=record.timestamp
        )
        db.add(obj)
        db_transactions.append(obj)
        
    await db.commit()
    for obj in db_transactions:
        await db.refresh(obj)
        
    return db_transactions

# Endpoint to retrieve all transactions for a specific user, sorted by timestamp in descending order. In a production environment, user authentication would be required to ensure users can only access their own transactions. The response model is defined to return a list of transaction records in a structured format.
@router.get("/", response_model=list[TransactionResponse])
async def get_user_transactions(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.timestamp.desc())
    )
    return result.scalars().all()