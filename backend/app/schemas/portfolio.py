from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    email_frequency: Optional[str] = None
    email_instructions: Optional[str] = None


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    email_frequency: Optional[str] = None
    email_instructions: Optional[str] = None


class PortfolioResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    email_frequency: Optional[str]
    email_instructions: Optional[str]
    file_path: Optional[str]
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True