# backend/app/services/forecasting.py (Updated Excerpt)
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sklearn.linear_model import Ridge  # <-- Swapped LinearRegression for Ridge
from app.models.transaction import Transaction

class ForecastingService:
    @staticmethod
    async def generate_spending_forecast(db: AsyncSession, user_id: int, forecast_days: int = 30) -> dict:
        # [Keep steps 1 & 2 exactly the same as before...]
        result = await db.execute(
            select(
                func.date(Transaction.timestamp).label("date"),
                func.sum(Transaction.amount).label("daily_total")
            )
            .where(Transaction.user_id == user_id)
            .group_by(func.date(Transaction.timestamp))
            .order_by(func.date(Transaction.timestamp).asc())
        )
        rows = result.all()

        if len(rows) < 5:
            return {"error": "Insufficient data baseline to construct a valid time-series model. Please upload at least 5 distinct days of transactions."}

        dates = [datetime.strptime(str(row.date), "%Y-%m-%d") for row in rows]
        daily_totals = [float(row.daily_total) for row in rows]

        start_date = dates[0]
        end_date = dates[-1]
        total_days = (end_date - start_date).days + 1

        timeline_dict = {date.strftime("%Y-%m-%d"): 0.0 for date in (start_date + timedelta(days=x) for x in range(total_days))}
        for d, amt in zip(dates, daily_totals):
            timeline_dict[d.strftime("%Y-%m-%d")] = amt

        X = np.array(list(range(total_days))).reshape(-1, 1)
        y = np.array(list(timeline_dict.values()))

        # --- UPDATED ML PIPELINE: SYSTEM REGULARIZATION ---
        # Using a straight linear model prevents explosive curves when projecting far out.
        # Ridge (L2 Regularization) keeps the daily trend line highly stable.
        model = Ridge(alpha=10.0) 
        model.fit(X, y)
        # --------------------------------------------------

        # 4. Out-of-Sample Inference
        future_X = np.array(list(range(total_days, total_days + forecast_days))).reshape(-1, 1)
        predictions = model.predict(future_X)
        
        # Enforce physical floor boundaries
        predictions = np.clip(predictions, a_min=0, a_max=None)

        # 5. Format results back into a clean payload for UI charts
        historical_points = [
            {"date": date_str, "amount": amt, "type": "historical"}
            for date_str, amt in timeline_dict.items()
        ]

        forecast_points = []
        for i, pred in enumerate(predictions):
            f_date = end_date + timedelta(days=i+1)
            forecast_points.append({
                "date": f_date.strftime("%Y-%m-%d"),
                "amount": round(float(pred), 2),
                "type": "forecast"
            })

        return {
            "historical": historical_points,
            "forecast": forecast_points,
            "metrics": {
                "historical_average_daily": round(float(np.mean(y)), 2),
                "predicted_cumulative_next_month": round(float(np.sum(predictions)), 2)
            }
        }