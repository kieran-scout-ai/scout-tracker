from pydantic import BaseModel
from datetime import datetime
import uuid


class EmailRecapCreate(BaseModel):
    subject: str
    content: str


class EmailRecapResponse(BaseModel):
    id: uuid.UUID
    subject: str
    content: str
    portfolio_id: uuid.UUID
    sent_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True