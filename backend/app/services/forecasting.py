# backend/app/services/forecasting.py
import numpy as np
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sklearn.linear_model import Ridge
from app.models.transaction import Transaction

class ForecastingService:
    @staticmethod
    async def generate_spending_forecast(db: AsyncSession, user_id: int, forecast_days: int = 30) -> dict:
        # 1. Fetch historical transactions
        result = await db.execute(
            select(
                func.date(Transaction.timestamp).label("tx_date"),
                func.sum(Transaction.amount).label("daily_total")
            )
            .where(Transaction.user_id == user_id)
            .group_by(func.date(Transaction.timestamp))
            .order_by(func.date(Transaction.timestamp).asc())
        )
        rows = result.all()

        if len(rows) < 5:
            return {
                "error": "Insufficient data baseline. Please upload at least 5 distinct days of transactions."
            }

        # 2. Parse dates and daily spend
        historical_dates = [datetime.strptime(str(row.tx_date), "%Y-%m-%d").date() for row in rows]
        daily_totals = [float(row.daily_total) for row in rows]

        first_tx_date = historical_dates[0]
        today = datetime.utcnow().date()

        # Total timeline runs from the first transaction up to TODAY
        # Even if the last transaction was 6 months ago, we bridge the timeline
        end_date = max(historical_dates[-1], today)
        total_days = (end_date - first_tx_date).days + 1

        timeline_dict = {
            (first_tx_date + timedelta(days=x)).strftime("%Y-%m-%d"): 0.0 
            for x in range(total_days)
        }
        for d, amt in zip(historical_dates, daily_totals):
            timeline_dict[d.strftime("%Y-%m-%d")] = amt

        # 3. Train Ridge model on historical index
        X = np.array(list(range(total_days))).reshape(-1, 1)
        y = np.array(list(timeline_dict.values()))

        model = Ridge(alpha=10.0)
        model.fit(X, y)

        # 4. Extrapolate from TODAY onwards into the future
        days_from_start_to_today = (today - first_tx_date).days
        future_X = np.array([
            days_from_start_to_today + i + 1 for i in range(forecast_days)
        ]).reshape(-1, 1)

        predictions = model.predict(future_X)
        predictions = np.clip(predictions, a_min=0, a_max=None)

        # 5. Build output: historical points (past) + forecast points (starting tomorrow)
        historical_points = [
            {"date": date_str, "amount": amt, "type": "historical"}
            for date_str, amt in timeline_dict.items()
            # Only send past points up to today to keep the chart clean
            if datetime.strptime(date_str, "%Y-%m-%d").date() <= today
        ]

        forecast_points = []
        for i, pred in enumerate(predictions):
            f_date = today + timedelta(days=i + 1)
            forecast_points.append({
                "date": f_date.strftime("%Y-%m-%d"),
                "amount": round(float(pred), 2),
                "type": "forecast"
            })

        # Calculate historical average from active spending days
        active_spends = [amt for amt in daily_totals if amt > 0]
        avg_daily = float(np.mean(active_spends)) if active_spends else 0.0

        return {
            "historical": historical_points,
            "forecast": forecast_points,
            "metrics": {
                "historical_average_daily": round(avg_daily, 2),
                "predicted_cumulative_next_month": round(float(np.sum(predictions)), 2)
            }
        }