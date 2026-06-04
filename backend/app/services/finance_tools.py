# backend/app/services/finance_tools.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select
from app.models.transaction import Transaction
from datetime import datetime, timedelta

class FinanceAnalyticsTools:
    @staticmethod
    async def get_spending_by_category(db: AsyncSession, user_id: int, days: int = 30) -> dict:
        """Calculates total spending grouped by category over a given window of days."""
        since_date = datetime.now() - timedelta(days=days)
        
        result = await db.execute(
            select(Transaction.category, func.sum(Transaction.amount).label("total"))
            .where(Transaction.user_id == user_id)
            .where(Transaction.timestamp >= since_date)
            .group_by(Transaction.category)
        )
        
        rows = result.all()
        return {row.category: float(row.total) for row in rows}

    @staticmethod
    async def get_merchant_history(db: AsyncSession, user_id: int, merchant_name: str) -> list[dict]:
        """Fetches historical transactions matching a specific merchant name search."""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .where(Transaction.merchant.ilike(f"%{merchant_name}%"))
            .order_by(Transaction.timestamp.desc())
        )
        
        txs = result.scalars().all()
        return [
            {"merchant": tx.merchant, "amount": float(tx.amount), "category": tx.category, "date": tx.timestamp.strftime("%Y-%m-%d")}
            for tx in txs
        ]