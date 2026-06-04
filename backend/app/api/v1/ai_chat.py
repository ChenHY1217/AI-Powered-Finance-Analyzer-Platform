# backend/app/api/v1/ai_chat.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ai_agent import ai_agent_service

router = APIRouter(prefix="/api/v1/chat", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

"""
This module defines the API endpoint for interacting with the AI copilot agent. The endpoint accepts user messages, forwards them to the FIAgentService for processing, and returns the agent's response. The service is designed to handle complex interactions, including invoking tool functions to fetch data from the database as needed to support the user's queries. Error handling is included to manage any issues that arise during the orchestration of the AI agent.
"""

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_copilot(
    payload: ChatRequest,
    user_id: int,  # Pass ?user_id=1 as query parameter for local validation testing
    db: AsyncSession = Depends(get_db)
):
    try:
        agent_reply = await ai_agent_service.chat_with_agent(user_id, payload.message, db)
        return ChatResponse(response=agent_reply)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Agent orchestration failed: {str(e)}"
        )