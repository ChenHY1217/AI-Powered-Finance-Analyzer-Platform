# backend/app/services/ingestion.py
import csv
from io import StringIO
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.schemas.transaction import TransactionCreate
from app.services.ml_classifier import classifier_service

class IngestionService:
    @staticmethod
    def parse_csv(file: UploadFile) -> list[TransactionCreate]:
        transactions = []
        try:
            contents = file.file.read().decode("utf-8")
            csv_reader = csv.DictReader(StringIO(contents))
            
            for row in csv_reader:
                try:
                    amount = float(row["amount"])
                    merchant = row["merchant"].strip()
                    timestamp_str = row["date"].strip()
                    
                    try:
                        timestamp = datetime.fromisoformat(timestamp_str)
                    except ValueError:
                        timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d")
                    
                    # --- ML INTEGRATION ENTRY POINT ---
                    csv_category = row.get("category", "").strip()
                    if not csv_category or csv_category.lower() == "uncategorized":
                        # If file contains no categorical reference, evaluate via ML pipeline inference
                        category = classifier_service.predict_category(merchant)
                    else:
                        category = csv_category
                    # -----------------------------------

                    transactions.append(
                        TransactionCreate(
                            amount=amount,
                            merchant=merchant,
                            category=category,
                            timestamp=timestamp
                        )
                    )
                except KeyError as e:
                    raise HTTPException(status_code=400, detail=f"Missing expected CSV header column: {str(e)}")
            return transactions
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            raise HTTPException(status_code=422, detail=f"Failed to parse CSV payload: {str(e)}")