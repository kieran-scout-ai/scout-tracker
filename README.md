# Scout Tracker

Portfolio tracking application with FastAPI backend and React frontend. Complete migration from Supabase to self-hosted solution with SQLite database persistence.

## 🚀 Features

- **Portfolio Management**: Create and manage multiple investment portfolios
- **CSV Upload**: Upload and process portfolio holdings from CSV files
- **Real-time Data**: View portfolio holdings with calculated market values
- **Email Recaps**: Configure automated email updates for portfolio performance
- **User Authentication**: Secure JWT-based authentication system
- **Database Persistence**: All data stored in SQLite database with proper relationships

## 🏗️ Architecture

**Frontend (React + TypeScript)**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS with shadcn-ui component library
- TanStack Query for server state management
- React Router DOM for navigation
- React Hook Form with Zod validation

**Backend (FastAPI + SQLite)**
- FastAPI for high-performance API endpoints
- SQLite database with SQLAlchemy ORM
- JWT authentication with bcrypt password hashing
- File upload processing for CSV imports
- CORS configured for cross-origin requests

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ and pip
- Git

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/kieran-scout-ai/scout-tracker.git
cd scout-tracker

# Install frontend dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your API base URL (default: http://127.0.0.1:8000)

# Start the development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database and JWT settings

# Start the FastAPI server
python test_server.py
```

## 🌐 API Endpoints

- `GET /` - API health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /api/portfolios/` - List user portfolios
- `POST /api/portfolios/` - Create new portfolio
- `POST /api/portfolios/{id}/upload-holdings` - Upload CSV file
- `POST /api/portfolios/{id}/process-holdings` - Process uploaded holdings
- `GET /api/portfolios/{id}/holdings` - Get portfolio holdings
- `GET /api/portfolios/{id}/recaps/latest` - Get latest email recap

## 📊 Database Schema

**Users**
- id, email, hashed_password, created_at, updated_at

**Portfolios**
- id, name, description, email_frequency, email_instructions, user_id, created_at, updated_at

**Portfolio Holdings**
- id, symbol, name, quantity, price, market_value, weight, sector, portfolio_id, created_at, updated_at

## 🚢 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting platform
```

### Backend Deployment
The FastAPI backend can be deployed using:
- **Docker**: Containerize with the included requirements.txt
- **Railway/Render**: Direct Python deployment
- **AWS/GCP/Azure**: Cloud platform deployment
- **VPS**: Traditional server deployment with nginx

## 🧪 Testing

### End-to-End Testing
1. Start both frontend and backend servers
2. Create a new user account
3. Create a portfolio
4. Upload a CSV file with holdings
5. Verify data persistence in database

### API Testing
```bash
# Test portfolio creation
curl -X POST "http://127.0.0.1:8000/api/portfolios/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Portfolio", "description": "Test"}'

# Test file upload
curl -X POST "http://127.0.0.1:8000/api/portfolios/{id}/upload-holdings" \
  -F "file=@portfolio.csv"
```

## 📖 Documentation

- `CLAUDE.md` - Comprehensive project documentation and guidelines
- `MIGRATION.md` - Details about the Supabase to FastAPI migration
- `backend/README.md` - Backend-specific setup and API documentation

## 🔐 Security

- JWT tokens for authentication
- Bcrypt password hashing
- CORS protection
- Input validation with Pydantic
- SQL injection protection with SQLAlchemy ORM

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
