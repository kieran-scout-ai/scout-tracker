# Scout Portfolio Tracker - FastAPI Backend

This is the FastAPI backend for the Scout Portfolio Tracker application, migrated from Supabase.

## Prerequisites

- Python 3.8+
- PostgreSQL database
- Virtual environment (recommended)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE scout_portfolio;
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/scout_portfolio
SECRET_KEY=your-very-secure-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 3. Run the Application

```bash
# Development mode with auto-reload
python run.py

# Or using uvicorn directly
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Portfolios
- `GET /api/portfolios/` - Get user portfolios
- `POST /api/portfolios/` - Create new portfolio
- `GET /api/portfolios/{id}` - Get specific portfolio
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio

### Holdings
- `GET /api/portfolios/{id}/holdings` - Get portfolio holdings
- `POST /api/portfolios/{id}/holdings` - Create new holding
- `PUT /api/portfolios/{id}/holdings/{holding_id}` - Update holding
- `DELETE /api/portfolios/{id}/holdings/{holding_id}` - Delete holding

### File Upload
- `POST /api/portfolios/{id}/upload-holdings` - Upload portfolio file
- `POST /api/portfolios/{id}/process-holdings` - Process uploaded file

### Email Recaps
- `GET /api/portfolios/{id}/recaps` - Get portfolio recaps
- `GET /api/portfolios/{id}/recaps/latest` - Get latest recap
- `POST /api/portfolios/{id}/recaps/generate` - Generate new recap

## Development

### Database Migrations

The application automatically creates database tables on startup. For production, consider using Alembic for proper migration management.

### File Storage

Uploaded files are stored in the `uploads/` directory. Ensure this directory has proper write permissions.

### CORS Configuration

The backend is configured to accept requests from:
- http://localhost:8080 (React dev server)
- http://127.0.0.1:8080

Update the CORS settings in `app/main.py` if needed.

## Migration Notes

This backend replaces the following Supabase features:

1. **Authentication**: JWT-based auth instead of Supabase Auth
2. **Database**: PostgreSQL with SQLAlchemy instead of Supabase DB
3. **File Storage**: Local file storage instead of Supabase Storage
4. **Edge Functions**: FastAPI endpoints instead of Supabase Functions

All API endpoints maintain compatibility with the existing React frontend.