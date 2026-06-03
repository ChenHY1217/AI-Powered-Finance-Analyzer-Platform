# backend/app/services/ml_classifier.py
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

MODEL_DIR = "app/static/models"
MODEL_PATH = f"{MODEL_DIR}/merchant_classifier.pkl"

"""
This module defines the MLClassifierService class, which encapsulates the logic for training and using a machine learning model to classify transaction merchants into categories. The service uses a TF-IDF vectorizer combined with a logistic regression classifier to learn from historical transaction data. The trained model is persisted to disk for reuse across application restarts, and a global singleton instance is provided for application-wide inference caching. The service includes error handling to ensure that if the model is not available or fails during prediction, it gracefully falls back to returning "Uncategorized".
"""

class MLClassifierService:
    def __init__(self):
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        """Loads the trained pipeline model from disk if it exists."""
        if os.path.exists(MODEL_PATH):
            try:
                self.pipeline = joblib.load(MODEL_PATH)
            except Exception:
                self.pipeline = None

    def train_baseline_model(self, data: list[dict[str, str]]):
        """
        Trains a TF-IDF + Logistic Regression pipeline.
        Data format: [{'merchant': 'Starbucks Cafe', 'category': 'Coffee'}, ...]
        """
        if not data:
            return False

        # Extract features and targets
        X = [item['merchant'].lower() for item in data]
        y = [item['category'] for item in data]

        # Check if we have enough distinct classes to train
        if len(set(y)) < 2:
            return False

        # Build production ML pipeline: Char/word n-grams catch subtle typos in merchant strings
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), analyzer='word', lowercase=True)),
            ('clf', LogisticRegression(C=1.0, max_iter=1000, class_weight='balanced'))
        ])

        # Fit the model
        pipeline.fit(X, y)
        self.pipeline = pipeline

        # Persist model to disk
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(pipeline, MODEL_PATH)
        return True

    def predict_category(self, merchant: str) -> str:
        """Predicts the category of a raw merchant string."""
        if not self.pipeline:
            return "Uncategorized"
        
        try:
            prediction = self.pipeline.predict([merchant.lower()])
            return prediction[0]
        except Exception:
            return "Uncategorized"

# Instantiate a global singleton instance for application-wide inference caching
classifier_service = MLClassifierService()