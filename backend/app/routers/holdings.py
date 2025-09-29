from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.user import User
from ..models.portfolio import Portfolio
from ..models.portfolio_holding import PortfolioHolding
from ..schemas.portfolio_holding import PortfolioHoldingCreate, PortfolioHoldingUpdate, PortfolioHoldingResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/portfolios", tags=["holdings"])


@router.get("/{portfolio_id}/holdings", response_model=List[PortfolioHoldingResponse])
def get_portfolio_holdings(
    portfolio_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify portfolio ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.portfolio_id == portfolio_id
    ).all()

    return holdings


@router.post("/{portfolio_id}/holdings", response_model=PortfolioHoldingResponse)
def create_holding(
    portfolio_id: uuid.UUID,
    holding_data: PortfolioHoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify portfolio ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    db_holding = PortfolioHolding(
        **holding_data.dict(),
        portfolio_id=portfolio_id
    )
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)

    return db_holding


@router.put("/{portfolio_id}/holdings/{holding_id}", response_model=PortfolioHoldingResponse)
def update_holding(
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    holding_data: PortfolioHoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify portfolio ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id
    ).first()

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found"
        )

    # Update holding with provided data
    update_data = holding_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(holding, field, value)

    db.commit()
    db.refresh(holding)

    return holding


@router.delete("/{portfolio_id}/holdings/{holding_id}")
def delete_holding(
    portfolio_id: uuid.UUID,
    holding_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify portfolio ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )

    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id
    ).first()

    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found"
        )

    db.delete(holding)
    db.commit()

    return {"message": "Holding deleted successfully"}