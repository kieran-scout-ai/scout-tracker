from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine

from .database import Base, engine
from .routers import auth, portfolios, holdings, recaps, upload
from .config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Scout Portfolio Tracker API",
    description="FastAPI backend for portfolio tracking application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:8081", "http://127.0.0.1:8081"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(portfolios.router)
app.include_router(holdings.router)
app.include_router(recaps.router)
app.include_router(upload.router)


@app.get("/")
def read_root():
    return {"message": "Scout Portfolio Tracker API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}