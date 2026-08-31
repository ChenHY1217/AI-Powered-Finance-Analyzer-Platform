# backend/app/api/v1/ai_chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.ai_agent import ai_agent_service

router = APIRouter(prefix="/api/v1/chat", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_copilot(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        agent_reply = await ai_agent_service.chat_with_agent(current_user.id, payload.message, db)
        return ChatResponse(response=agent_reply)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Agent orchestration failed: {str(e)}"
        )