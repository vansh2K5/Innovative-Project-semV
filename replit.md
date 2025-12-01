# Employee Management System - Replit Setup

## Overview
This is a full-stack Employee Management System built with Next.js 16, React 19, TypeScript, and MongoDB. The application provides user management, calendar/event tracking, and performance analytics with role-based access control.

## Recent Changes (December 1, 2025)
- Configured for Replit environment
- Updated Next.js dev server to run on port 5000 with host 0.0.0.0
- Added `allowedDevOrigins: ['*']` to Next.js config for Replit proxy support
- Cleaned and reinstalled dependencies
- Workflow configured for frontend (Start application)

## Project Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB (requires connection string)
- **Authentication:** JWT with bcryptjs
- **UI Components:** Radix UI, Lucide Icons, GSAP animations

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management (admin only)
│   │   ├── events/        # Calendar/events
│   │   └── analytics/     # Performance tracking
│   ├── homePage/          # User dashboard
│   ├── adminUi/           # Admin dashboard
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── lib/
│   ├── models/            # Mongoose models
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   └── Analytics.ts
│   ├── db.ts              # MongoDB connection
│   ├── auth.ts            # Auth utilities
│   └── api.ts             # Frontend API client
└── components/            # React components
```

## Configuration

### Required Environment Variables
- `MONGODB_URI` - MongoDB connection string (MongoDB Atlas recommended)
- `SESSION_SECRET` - Already set (for JWT signing)

### Ports
- Frontend: 5000 (webview)
- Backend: Integrated with frontend (Next.js API routes)

### Database Setup
The application requires MongoDB. Once connected, run:
```bash
npm run setup
```
This creates the database schema, indexes, and sample users.

## User Preferences
None documented yet.

## Key Features
- 🔐 JWT-based authentication with role-based access control
- 👥 User management (admin only)
- 📅 Calendar with events, meetings, tasks, deadlines
- 📊 Performance analytics and activity tracking
- 🎨 Modern UI with TailwindCSS and animations

## Default Credentials (after DB setup)
- Admin: `admin@ems.com` / `admin123`
- User: `user@ems.com` / `user123`
