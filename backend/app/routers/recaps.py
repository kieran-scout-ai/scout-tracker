from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models.user import User
from ..models.portfolio import Portfolio
from ..models.email_recap import EmailRecap
from ..schemas.email_recap import EmailRecapCreate, EmailRecapResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/portfolios", tags=["email-recaps"])


@router.get("/{portfolio_id}/recaps", response_model=List[EmailRecapResponse])
def get_portfolio_recaps(
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

    recaps = db.query(EmailRecap).filter(
        EmailRecap.portfolio_id == portfolio_id
    ).order_by(EmailRecap.sent_at.desc()).all()

    return recaps


@router.get("/{portfolio_id}/recaps/latest", response_model=EmailRecapResponse)
def get_latest_recap(
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

    latest_recap = db.query(EmailRecap).filter(
        EmailRecap.portfolio_id == portfolio_id
    ).order_by(EmailRecap.sent_at.desc()).first()

    if not latest_recap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No email recaps found for this portfolio"
        )

    return latest_recap


@router.post("/{portfolio_id}/recaps", response_model=EmailRecapResponse)
def create_recap(
    portfolio_id: uuid.UUID,
    recap_data: EmailRecapCreate,
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

    db_recap = EmailRecap(
        **recap_data.dict(),
        portfolio_id=portfolio_id
    )
    db.add(db_recap)
    db.commit()
    db.refresh(db_recap)

    return db_recap


@router.post("/{portfolio_id}/recaps/generate", response_model=EmailRecapResponse)
def generate_recap(
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

    # TODO: Implement actual email recap generation logic
    # For now, create a simple recap
    recap_content = f"""
    Portfolio Recap for {portfolio.name}

    This is an automated recap of your portfolio performance.

    Portfolio Details:
    - Name: {portfolio.name}
    - Description: {portfolio.description or 'No description provided'}

    Generated automatically by Scout Portfolio Tracker.
    """

    db_recap = EmailRecap(
        subject=f"Portfolio Recap: {portfolio.name}",
        content=recap_content.strip(),
        portfolio_id=portfolio_id
    )
    db.add(db_recap)
    db.commit()
    db.refresh(db_recap)

    return db_recap