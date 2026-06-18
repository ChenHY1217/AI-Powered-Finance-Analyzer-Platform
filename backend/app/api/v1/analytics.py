# backend/app/api/v1/analytics.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.forecasting import ForecastingService

router = APIRouter(prefix="/api/v1/analytics", tags=["Predictive Analytics"])

# This endpoint provides a 30-day spending forecast for a user based on their historical transaction data. It utilizes polynomial regression to capture non-linear spending trends and requires a minimum of 5 distinct days of transaction history to ensure model validity.
@router.get("/forecast", status_code=status.HTTP_200_OK)
async def get_spending_projection(user_id: int, db: AsyncSession = Depends(get_db)):
    data = await ForecastingService.generate_spending_forecast(db, user_id)
    if "error" in data:
        raise HTTPException(status_code=400, detail=data["error"])
    return data