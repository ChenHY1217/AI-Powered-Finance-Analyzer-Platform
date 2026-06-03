from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db

from pydantic import BaseModel
from sqlalchemy.future import select
from app.models.user import User
from app.models.budget import Budget
from app.models.transaction import Transaction

# Import API routers
from app.api.v1.transactions import router as transaction_router
from app.api.v1.ml import router as ml_router

app = FastAPI(title=settings.PROJECT_NAME)

# Enable CORS for our Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transaction_router)
app.include_router(ml_router)

# Health check endpoint to verify API and DB connectivity
@app.get("/api/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Execute raw SQL check to verify DB liveness
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}
    
class UserCreate(BaseModel):
    email: str

# Temporary endpoint to create test users for development purposes. In production, this would be handled by a proper Auth service.
@app.post("/api/test-user", status_code=201)
async def create_test_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        return {"message": "User already exists", "user_id": existing_user.id}
        
    new_user = User(email=payload.email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"message": "Test user created successfully", "user_id": new_user.id}