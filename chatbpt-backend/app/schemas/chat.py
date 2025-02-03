from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    message: str
    response: str

class ChatHistoryResponse(BaseModel):
    id: int
    user_id: int
    message: str
    response: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True

class ChatHistoryListResponse(BaseModel):
    chats: list[ChatHistoryResponse]