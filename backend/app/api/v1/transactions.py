# backend/app/api/v1/transactions.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal, get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionResponse
from app.services.ingestion import IngestionService
from app.services.ml_classifier import classifier_service

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])

async def retrain_classifier_task() -> None:
    """Retrain the merchant classifier from the latest persisted transaction data."""
    async with AsyncSessionLocal() as training_db:
        result = await training_db.execute(
            select(Transaction).where(Transaction.category != "Uncategorized")
        )
        transactions = result.scalars().all()

        training_data = [
            {"merchant": tx.merchant, "category": tx.category}
            for tx in transactions
        ]

        if len(training_data) < 10:
            return

        classifier_service.train_baseline_model(training_data)

@router.post("/upload", response_model=list[TransactionResponse], status_code=status.HTTP_201_CREATED)
async def upload_transactions_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file extension. Only .csv supported.")

    parsed_records = IngestionService.parse_csv(file)
    
    db_transactions = []
    for record in parsed_records:
        obj = Transaction(
            user_id=current_user.id,
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

    background_tasks.add_task(retrain_classifier_task)
    return db_transactions

@router.get("/", response_model=list[TransactionResponse])
async def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.timestamp.desc())
    )
    return result.scalars().all()