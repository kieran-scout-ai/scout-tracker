from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
import uuid


class PortfolioHoldingCreate(BaseModel):
    symbol: str
    name: Optional[str] = None
    quantity: Optional[Decimal] = None
    price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    sector: Optional[str] = None


class PortfolioHoldingUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    quantity: Optional[Decimal] = None
    price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    sector: Optional[str] = None
    validated: Optional[bool] = None
    validation_status: Optional[str] = None


class PortfolioHoldingResponse(BaseModel):
    id: uuid.UUID
    symbol: str
    name: Optional[str]
    quantity: Optional[Decimal]
    price: Optional[Decimal]
    market_value: Optional[Decimal]
    weight: Optional[Decimal]
    sector: Optional[str]
    validated: Optional[bool]
    validation_status: Optional[str]
    portfolio_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True