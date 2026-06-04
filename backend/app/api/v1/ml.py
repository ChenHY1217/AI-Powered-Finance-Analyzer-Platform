# backend/app/api/v1/ml.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.transaction import Transaction
from app.services.ml_classifier import classifier_service

router = APIRouter(prefix="/api/v1/ml", tags=["Machine Learning"])

"""
This module defines the API endpoints for interacting with the machine learning services, specifically for training the transaction category classifier.
"""

# Endpoint to trigger training of the transaction category classifier. This endpoint fetches all transactions with valid categories, formats them for training, and invokes the ML service to train and persist the model. In a production environment, this would likely be a protected endpoint accessible only to admin users or triggered via a scheduled job rather than being exposed directly.
@router.post("/train", status_code=status.HTTP_200_OK)
async def train_classifier(db: AsyncSession = Depends(get_db)):
    # Fetch all user transactions that have a valid assigned category
    result = await db.execute(
        select(Transaction).where(Transaction.category != "Uncategorized")
    )
    transactions = result.scalars().all()

    # Format the relational rows into training dictionaries
    training_data = [
        {"merchant": tx.merchant, "category": tx.category} for tx in transactions
    ]

    if len(training_data) < 10:  # Arbitrary small safety limit for cold start
        raise HTTPException(
            status_code=400,
            detail=f"Insufficent training examples. Found {len(training_data)}, need at least 10."
        )

    success = classifier_service.train_baseline_model(training_data)
    
    if not success:
        raise HTTPException(status_code=500, detail="Model training pipeline execution failed.")
        
    return {"message": "Classifier trained and persisted successfully", "records_trained": len(training_data)}