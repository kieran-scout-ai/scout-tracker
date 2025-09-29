# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based portfolio tracking application currently being migrated from Supabase to a FastAPI + PostgreSQL backend. The frontend (React + TypeScript + Vite) is preserved while the backend infrastructure is being modernized.

## Migration Context

**Current State**: Supabase-based backend with React frontend
**Target State**: FastAPI + PostgreSQL backend with preserved React frontend
**Migration Strategy**: Replace Supabase client calls with FastAPI HTTP requests while maintaining existing UI/UX

## Common Development Commands

### Frontend Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Installation
- `npm i` - Install dependencies

## Current Tech Stack (Frontend Preserved)

### Core Technologies
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS with shadcn-ui component library
- **State Management**: TanStack Query for server state (ideal for API calls)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

### Key Dependencies for Migration
- **TanStack Query**: Perfect for FastAPI integration - handles caching, loading states, error handling
- **UI Components**: shadcn-ui (Radix UI primitives) - no changes needed
- **Charts**: Recharts for data visualization - no changes needed
- **Validation**: Zod schemas can be shared between frontend and FastAPI (Pydantic compatibility)

## Project Structure (Frontend)

### Pages (`src/pages/`)
- `Index.tsx` - Landing/home page
- `Auth.tsx` - Authentication page (needs API endpoint updates)
- `Dashboard.tsx` - Main dashboard with portfolio overview (needs API integration)
- `Upload.tsx` - File upload interface (needs FastAPI file upload endpoints)
- `UploadHoldings.tsx` - Portfolio-specific holdings upload
- `Pricing.tsx` - Pricing information page
- `NotFound.tsx` - 404 error page

### Components Requiring Migration (`src/components/`)
- `dashboard/EmailRecapDisplay.tsx` - Email recap functionality
- `dashboard/PortfolioHoldings.tsx` - Portfolio holdings display
- `dashboard/PortfolioSelector.tsx` - Portfolio selection interface
- `dashboard/PortfolioSettings.tsx` - Portfolio configuration

### Integration Layer (Needs Replacement)
- `src/integrations/supabase/` - **TO BE REPLACED** with FastAPI client
  - Replace `client.ts` with FastAPI HTTP client
  - Replace `types.ts` with TypeScript interfaces matching FastAPI models

## Migration Strategy

### Backend Endpoints Needed
Based on current Supabase usage, FastAPI needs:
- **Authentication**: JWT-based auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`)
- **Portfolios**: CRUD operations (`/portfolios/`, `/portfolios/{id}`)
- **Holdings**: Upload and manage portfolio holdings (`/holdings/`, `/portfolios/{id}/holdings`)
- **Users**: User profile management (`/users/me`)
- **File Upload**: Handle CSV/Excel uploads (`/upload/`)

### Frontend Migration Points
1. **Replace Supabase Client**: Create FastAPI HTTP client using fetch/axios
2. **Update TanStack Query Hooks**: Modify query functions to call FastAPI endpoints
3. **Authentication Flow**: Replace Supabase auth with JWT token management
4. **Type Definitions**: Generate TypeScript types from FastAPI/Pydantic models
5. **Environment Variables**: Update to FastAPI backend URL

### Preserved Frontend Features
- All UI components and styling (shadcn-ui + Tailwind)
- Form handling and validation (React Hook Form + Zod)
- Routing structure (React Router DOM)
- State management patterns (TanStack Query)
- Build tooling (Vite + TypeScript)

## Development Guidelines

### Environment Setup
- Vite with path aliases (`@/` points to `src/`)
- New environment variables needed:
  - `VITE_API_BASE_URL` - FastAPI backend URL
  - `VITE_API_VERSION` - API version (e.g., `/api/v1`)

### Migration-Friendly Patterns
- TanStack Query abstracts data fetching - perfect for API migration
- Component separation allows backend changes without UI modifications
- Zod schemas can be converted to match Pydantic models
- TypeScript interfaces provide type safety during migration

### Code Style (Unchanged)
- ESLint configuration with TypeScript support
- React hooks and refresh plugins enabled
- Consistent use of `cn()` utility for class merging

## Database Migration Notes

### Current Supabase Schema
- Portfolio tracking with user authentication
- Holdings data with file upload capability
- User profiles and settings

### PostgreSQL Target Schema
- Equivalent tables with proper foreign key relationships
- User authentication table (replace Supabase auth)
- Portfolio and holdings tables with proper indexing
- File metadata tracking for uploads

## Development Server

- Frontend runs on `localhost:8080`
- FastAPI backend should run on different port (e.g., `localhost:8000`)
- CORS configuration needed for local development

## Important Migration Considerations

- **Authentication**: Move from Supabase auth to JWT tokens
- **File Uploads**: Replace Supabase storage with FastAPI file handling
- **Real-time Features**: If any Supabase real-time subscriptions exist, replace with polling or WebSockets
- **Database Types**: Ensure PostgreSQL schema matches expected data structures
- **Error Handling**: Update error handling for HTTP status codes vs Supabase errors