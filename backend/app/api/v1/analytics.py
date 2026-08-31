# backend/app/api/v1/analytics.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.forecasting import ForecastingService

router = APIRouter(prefix="/api/v1/analytics", tags=["Predictive Analytics"])

@router.get("/forecast", status_code=status.HTTP_200_OK)
async def get_spending_projection(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    data = await ForecastingService.generate_spending_forecast(db, current_user.id)
    if "error" in data:
        raise HTTPException(status_code=400, detail=data["error"])
    return data