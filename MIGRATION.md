# Migration Guide: Supabase → FastAPI + PostgreSQL

This document outlines the successful migration from Supabase to FastAPI + PostgreSQL while preserving the React frontend.

## Migration Overview

✅ **Successfully Migrated Components:**

### Backend (FastAPI)
- ✅ JWT Authentication system
- ✅ PostgreSQL database with SQLAlchemy models
- ✅ RESTful API endpoints for all operations
- ✅ File upload and processing functionality
- ✅ Email recap generation
- ✅ CORS configuration for React frontend

### Frontend (React - Preserved)
- ✅ All UI components and styling unchanged
- ✅ Updated to use FastAPI HTTP client
- ✅ TanStack Query for state management (unchanged)
- ✅ Form validation and error handling (unchanged)
- ✅ React Router for navigation (unchanged)

## Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your PostgreSQL credentials
python run.py
```

### 2. Frontend Setup
```bash
cd ..  # Back to root
cp .env.example .env
# Edit .env with VITE_API_BASE_URL=http://localhost:8000
npm install
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Architecture Changes

### Before (Supabase)
```
React Frontend ←→ Supabase Client ←→ Supabase Cloud
                                  ├── Database
                                  ├── Auth
                                  ├── Storage
                                  └── Edge Functions
```

### After (FastAPI + PostgreSQL)
```
React Frontend ←→ HTTP Client ←→ FastAPI Backend ←→ PostgreSQL
                              ├── JWT Auth
                              ├── File Storage
                              └── Business Logic
```

## Database Schema Mapping

| Supabase Table | FastAPI Model | Status |
|----------------|---------------|---------|
| auth.users | User | ✅ Migrated |
| portfolios | Portfolio | ✅ Migrated |
| portfolio_holdings | PortfolioHolding | ✅ Migrated |
| email_recaps | EmailRecap | ✅ Migrated |

## API Endpoint Mapping

| Frontend Function | Old (Supabase) | New (FastAPI) |
|-------------------|----------------|---------------|
| User Registration | `supabase.auth.signUp()` | `POST /auth/register` |
| User Login | `supabase.auth.signInWithPassword()` | `POST /auth/login` |
| Get Portfolios | `supabase.from('portfolios').select()` | `GET /api/portfolios/` |
| Upload File | `supabase.storage.upload()` | `POST /api/portfolios/{id}/upload-holdings` |
| Process Holdings | `supabase.functions.invoke()` | `POST /api/portfolios/{id}/process-holdings` |

## Key Features Preserved

✅ **Complete UI/UX preservation** - All components, styling, and user interactions remain identical
✅ **Authentication flow** - Users can register, login, and access protected routes
✅ **Portfolio management** - Create, read, update, delete portfolios
✅ **File upload** - CSV/Excel file upload with preview and column mapping
✅ **Holdings management** - View and manage portfolio holdings
✅ **Email recaps** - Generate and view portfolio email summaries
✅ **Responsive design** - All existing responsive behavior maintained

## Benefits of Migration

1. **Full Control**: Own the entire stack without vendor lock-in
2. **Cost Efficiency**: No monthly Supabase subscription fees
3. **Scalability**: Deploy anywhere (cloud, on-premise, containers)
4. **Customization**: Complete control over business logic and data processing
5. **Performance**: Optimized database queries and file processing
6. **Security**: Custom JWT implementation with configurable token expiry

## File Structure

```
scout-my-portfolio/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   ├── auth/           # JWT authentication
│   │   └── main.py         # FastAPI app
│   ├── uploads/            # File storage
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend (preserved)
│   ├── components/         # UI components (unchanged)
│   ├── pages/              # Route components (updated API calls)
│   ├── lib/
│   │   └── api.ts          # New FastAPI client
│   └── ...
└── CLAUDE.md              # Updated development guide
```

## Testing the Migration

1. **Start both services**:
   - Backend: `cd backend && python run.py`
   - Frontend: `npm run dev`

2. **Test complete user flow**:
   - ✅ User registration/login
   - ✅ Portfolio creation
   - ✅ File upload and processing
   - ✅ Holdings viewing
   - ✅ Email recap generation

3. **Verify data persistence**:
   - ✅ User data saved to PostgreSQL
   - ✅ Portfolios and holdings persist between sessions
   - ✅ File uploads processed correctly

## Production Deployment

For production deployment:

1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. **Backend**: Deploy FastAPI with Docker or cloud platforms (Heroku, Railway, DigitalOcean)
3. **Frontend**: Build and deploy to CDN (Vercel, Netlify, AWS S3)
4. **Environment**: Update CORS and environment variables for production URLs

The migration is complete and the application is fully functional with the new FastAPI backend!