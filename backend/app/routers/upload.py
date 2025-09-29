from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import uuid
import os
import csv
from pathlib import Path

from ..database import get_db
from ..models.user import User
from ..models.portfolio import Portfolio
from ..models.portfolio_holding import PortfolioHolding
from ..auth import get_current_user

router = APIRouter(prefix="/api/portfolios", tags=["file-upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


def read_file_data(file_path: Path) -> Dict[str, Any]:
    """Read CSV file and return data structure"""
    file_extension = file_path.suffix.lower()

    if file_extension == ".csv":
        with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
            # Try to detect delimiter
            sample = csvfile.read(1024)
            csvfile.seek(0)
            dialect = csv.Sniffer().sniff(sample)

            reader = csv.reader(csvfile, dialect)
            rows = list(reader)

            if not rows:
                raise ValueError("CSV file is empty")

            headers = rows[0]
            data_rows = rows[1:] if len(rows) > 1 else []

            return {
                "headers": headers,
                "rows": data_rows,
                "total_rows": len(data_rows)
            }
    else:
        raise ValueError(f"Unsupported file format: {file_extension}. Only CSV files are supported for now.")


@router.post("/{portfolio_id}/upload-holdings")
async def upload_portfolio_file(
    portfolio_id: uuid.UUID,
    file: UploadFile = File(...),
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

    # Validate file type
    if not file.filename or not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only CSV and Excel files are allowed."
        )

    try:
        # Save uploaded file
        file_extension = get_file_extension(file.filename)
        file_name = f"{portfolio_id}_{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / file_name

        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Read and parse file
        file_data = read_file_data(file_path)

        # Return file preview data
        preview_data = {
            "headers": file_data["headers"],
            "rows": file_data["rows"][:10],  # First 10 rows for preview
            "total_rows": file_data["total_rows"],
            "file_name": file.filename,
            "file_path": str(file_path)
        }

        # Update portfolio file path
        portfolio.file_path = str(file_path)
        db.commit()

        return preview_data

    except Exception as e:
        # Clean up file if processing failed
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )


@router.post("/{portfolio_id}/process-holdings")
async def process_portfolio_holdings(
    portfolio_id: uuid.UUID,
    column_mapping: Dict[str, Any],
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

    if not portfolio.file_path or not Path(portfolio.file_path).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No uploaded file found for this portfolio"
        )

    try:
        # Read the uploaded file
        file_data = read_file_data(Path(portfolio.file_path))

        # Extract column mappings
        symbol_col = column_mapping.get("tickerColumn")
        name_col = column_mapping.get("nameColumn")

        if symbol_col is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Symbol/Ticker column mapping is required"
            )

        # Clear existing holdings for this portfolio
        db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).delete()

        # Process each row and create holdings
        holdings_created = 0
        headers = file_data["headers"]

        for row in file_data["rows"]:
            if len(row) <= symbol_col:
                continue

            symbol = row[symbol_col] if row[symbol_col] else None
            name = row[name_col] if name_col is not None and len(row) > name_col and row[name_col] else None

            if symbol and str(symbol).strip():
                # Try to extract other common columns
                quantity = None
                price = None
                market_value = None

                # Look for common column names
                for col_idx, col_name in enumerate(headers):
                    if col_idx < len(row) and row[col_idx]:
                        col_name_lower = str(col_name).lower()
                        try:
                            if "quantity" in col_name_lower or "shares" in col_name_lower:
                                quantity = float(row[col_idx])
                            elif "price" in col_name_lower and "market" not in col_name_lower:
                                price = float(row[col_idx])
                            elif "market" in col_name_lower and "value" in col_name_lower:
                                market_value = float(row[col_idx])
                        except (ValueError, TypeError):
                            pass

                # Create holding
                holding = PortfolioHolding(
                    symbol=str(symbol).upper().strip(),
                    name=str(name).strip() if name else None,
                    quantity=quantity,
                    price=price,
                    market_value=market_value,
                    portfolio_id=portfolio_id,
                    validated=False,
                    validation_status="pending"
                )

                db.add(holding)
                holdings_created += 1

        db.commit()

        return {
            "message": f"Successfully processed {holdings_created} holdings",
            "holdings_created": holdings_created
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing holdings: {str(e)}"
        )