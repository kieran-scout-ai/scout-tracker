from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String, nullable=False)
    name = Column(String, nullable=True)
    quantity = Column(Numeric(precision=18, scale=8), nullable=True)
    price = Column(Numeric(precision=18, scale=2), nullable=True)
    market_value = Column(Numeric(precision=18, scale=2), nullable=True)
    weight = Column(Numeric(precision=5, scale=2), nullable=True)
    sector = Column(String, nullable=True)
    validated = Column(Boolean, default=False)
    validation_status = Column(String, nullable=True)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="holdings")