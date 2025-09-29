#!/usr/bin/env python3
"""
Simple test server to verify FastAPI backend is working
"""
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
import uuid
import io
import csv
import sqlite3
import hashlib
import os
from datetime import datetime

app = FastAPI(
    title="Scout Portfolio Tracker API",
    description="FastAPI backend for portfolio tracking application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=False,  # Must be False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Scout Portfolio Tracker API", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Pydantic models for request bodies
class UserRegistration(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class PortfolioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    email_frequency: Optional[str] = "weekly"
    email_instructions: Optional[str] = None

class ColumnMapping(BaseModel):
    tickerColumn: int
    nameColumn: Optional[int] = None

# SQLite database setup
DB_PATH = "scout_portfolio.db"

def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')

    # Create portfolios table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolios (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            email_frequency TEXT,
            email_instructions TEXT,
            file_path TEXT,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Create portfolio_holdings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_holdings (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            name TEXT,
            quantity REAL,
            price REAL,
            market_value REAL,
            weight REAL,
            sector TEXT,
            validated INTEGER DEFAULT 0,
            validation_status TEXT,
            portfolio_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        )
    ''')

    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

# Initialize database on startup
init_database()

# Handle OPTIONS requests explicitly
@app.options("/auth/register")
async def handle_register_options():
    return JSONResponse(content={"message": "OK"}, status_code=200)

@app.options("/auth/login")
async def handle_login_options():
    return JSONResponse(content={"message": "OK"}, status_code=200)

@app.options("/api/portfolios/")
async def handle_portfolios_options():
    return JSONResponse(content={"message": "OK"}, status_code=200)

@app.options("/api/portfolios/{portfolio_id}/upload-holdings")
async def handle_upload_holdings_options(portfolio_id: str):
    return JSONResponse(content={"message": "OK"}, status_code=200)

@app.options("/api/portfolios/{portfolio_id}/process-holdings")
async def handle_process_holdings_options(portfolio_id: str):
    return JSONResponse(content={"message": "OK"}, status_code=200)

@app.post("/auth/register")
def register(user_data: UserRegistration):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        user_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat() + "Z"
        hashed_pw = hash_password(user_data.password)

        cursor.execute(
            "INSERT INTO users (id, email, hashed_password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, user_data.email, hashed_pw, current_time, current_time)
        )
        conn.commit()

        return {
            "id": user_id,
            "email": user_data.email,
            "created_at": current_time
        }
    except sqlite3.IntegrityError:
        return JSONResponse(
            content={"detail": "User with this email already exists"},
            status_code=400
        )
    finally:
        conn.close()

@app.post("/auth/login")
def login(credentials: UserLogin):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        hashed_pw = hash_password(credentials.password)
        cursor.execute(
            "SELECT id, email FROM users WHERE email = ? AND hashed_password = ?",
            (credentials.email, hashed_pw)
        )
        user = cursor.fetchone()

        if not user:
            return JSONResponse(
                content={"detail": "Invalid email or password"},
                status_code=401
            )

        return {
            "access_token": f"token-{user[0]}",
            "refresh_token": f"refresh-{user[0]}",
            "token_type": "bearer"
        }
    finally:
        conn.close()

@app.get("/api/portfolios/")
def get_portfolios():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, name, description, email_frequency, email_instructions,
                   file_path, user_id, created_at, updated_at
            FROM portfolios
            ORDER BY created_at DESC
        """)

        portfolios = []
        for row in cursor.fetchall():
            portfolio = {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "email_frequency": row[3],
                "email_instructions": row[4],
                "file_path": row[5],
                "user_id": row[6],
                "created_at": row[7],
                "updated_at": row[8]
            }
            portfolios.append(portfolio)

        return portfolios
    finally:
        conn.close()

@app.post("/api/portfolios/")
def create_portfolio(portfolio_data: PortfolioCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        portfolio_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat() + "Z"

        cursor.execute("""
            INSERT INTO portfolios (id, name, description, email_frequency,
                                   email_instructions, file_path, user_id,
                                   created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            portfolio_id,
            portfolio_data.name,
            portfolio_data.description,
            portfolio_data.email_frequency,
            portfolio_data.email_instructions,
            None,  # file_path will be set when file is uploaded
            "mock-user-id",  # TODO: Get from JWT token
            current_time,
            current_time
        ))

        conn.commit()

        return {
            "id": portfolio_id,
            "name": portfolio_data.name,
            "description": portfolio_data.description,
            "email_frequency": portfolio_data.email_frequency,
            "email_instructions": portfolio_data.email_instructions,
            "file_path": None,
            "user_id": "mock-user-id",
            "created_at": current_time,
            "updated_at": current_time
        }
    finally:
        conn.close()

@app.post("/api/portfolios/{portfolio_id}/upload-holdings")
async def upload_holdings(portfolio_id: str, file: UploadFile = File(...)):
    # Mock file upload processing
    if not file.filename:
        return JSONResponse(
            content={"detail": "No file provided"},
            status_code=400
        )

    # Read and parse CSV content
    content = await file.read()
    content_str = content.decode('utf-8')

    # Parse CSV
    csv_reader = csv.reader(io.StringIO(content_str))
    rows = list(csv_reader)

    if len(rows) < 2:
        return JSONResponse(
            content={"detail": "File must have at least header and one data row"},
            status_code=400
        )

    headers = rows[0]
    data_rows = rows[1:6]  # First 5 data rows for preview

    return {
        "headers": headers,
        "rows": data_rows,
        "total_rows": len(rows) - 1,
        "file_name": file.filename,
        "file_path": f"/uploads/{portfolio_id}/{file.filename}"
    }

@app.post("/api/portfolios/{portfolio_id}/process-holdings")
def process_holdings(portfolio_id: str, column_mapping: ColumnMapping):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # For now, create some sample holdings for demo purposes
        # In a real implementation, this would parse the uploaded CSV file
        sample_holdings = [
            {"symbol": "AAPL", "name": "Apple Inc.", "quantity": 100, "price": 175.50},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "quantity": 75, "price": 350.25},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "quantity": 50, "price": 138.75},
        ]

        holdings_created = 0
        current_time = datetime.now().isoformat() + "Z"

        for holding in sample_holdings:
            holding_id = str(uuid.uuid4())
            market_value = holding["quantity"] * holding["price"]

            cursor.execute("""
                INSERT INTO portfolio_holdings (id, symbol, name, quantity, price,
                                               market_value, weight, sector, validated,
                                               validation_status, portfolio_id,
                                               created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                holding_id,
                holding["symbol"],
                holding["name"],
                holding["quantity"],
                holding["price"],
                market_value,
                0.33,  # Default weight
                "Technology",  # Default sector
                1,  # validated = True
                "verified",
                portfolio_id,
                current_time,
                current_time
            ))
            holdings_created += 1

        conn.commit()

        return {
            "message": f"Successfully processed holdings for portfolio {portfolio_id}",
            "holdings_created": holdings_created
        }
    finally:
        conn.close()

@app.get("/api/portfolios/{portfolio_id}/holdings")
def get_portfolio_holdings(portfolio_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, symbol, name, quantity, price, market_value, weight,
                   sector, validated, validation_status, portfolio_id,
                   created_at, updated_at
            FROM portfolio_holdings
            WHERE portfolio_id = ?
            ORDER BY created_at ASC
        """, (portfolio_id,))

        holdings = []
        for row in cursor.fetchall():
            holding = {
                "id": row[0],
                "symbol": row[1],
                "name": row[2],
                "quantity": row[3],
                "price": row[4],
                "market_value": row[5],
                "weight": row[6],
                "sector": row[7],
                "validated": bool(row[8]),
                "validation_status": row[9],
                "portfolio_id": row[10],
                "created_at": row[11],
                "updated_at": row[12]
            }
            holdings.append(holding)

        return holdings
    finally:
        conn.close()

@app.get("/api/portfolios/{portfolio_id}/recaps/latest")
def get_latest_recap(portfolio_id: str):
    # Mock latest recap data
    if portfolio_id == "portfolio-1":
        return {
            "id": "recap-1",
            "subject": "Tech Portfolio Weekly Update - Strong Earnings Season Ahead",
            "content": "**Market Overview**\n\nTech stocks showed resilience this week despite broader market volatility. Your portfolio holdings AAPL and MSFT both demonstrated strong fundamentals ahead of earnings season.\n\n**AAPL Analysis**\n- Trading at $175.50, up 2.3% this week\n- iPhone 15 sales data showing strong international demand\n- Services revenue growth continuing at 8% YoY\n- Analyst price targets ranging from $180-200\n\n**MSFT Analysis** \n- Closed at $350.25, gaining 1.8% weekly\n- Azure cloud growth accelerating at 29% QoQ\n- AI integration driving enterprise adoption\n- Strong positioning for upcoming earnings\n\n**Key Events This Week**\n- Fed meeting minutes released, no surprises\n- Tech sector rotation continuing into Q1\n- Options activity elevated ahead of earnings\n\n**Outlook**\nBoth holdings remain well-positioned for earnings season. Consider monitoring implied volatility levels for potential opportunities.",
            "portfolio_id": portfolio_id,
            "sent_at": "2024-01-22T08:00:00Z",
            "created_at": "2024-01-22T07:30:00Z"
        }
    else:
        return {
            "id": "recap-2",
            "subject": "Dividend Portfolio Daily Brief - Yield Updates",
            "content": "**Dividend Focus**\n\nYour dividend-focused portfolio continues to provide steady income with recent announcements from key holdings.\n\n**JNJ Update**\n- Declared quarterly dividend of $1.19 per share\n- Ex-dividend date: February 15th\n- 62nd consecutive year of dividend increases\n- Yield currently at 2.95%\n\n**Sector Analysis**\n- Healthcare dividends showing stability\n- Utility sector facing interest rate headwinds\n- REITs recovering from recent weakness\n\n**Income Projection**\nBased on current holdings, projected quarterly income: $238 from JNJ alone. Total portfolio yield tracking at 3.2%.",
            "portfolio_id": portfolio_id,
            "sent_at": "2024-01-22T12:00:00Z",
            "created_at": "2024-01-22T11:45:00Z"
        }

if __name__ == "__main__":
    uvicorn.run(
        "test_server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )