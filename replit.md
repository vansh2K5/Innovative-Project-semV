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
- `MONGODB_URI` - MongoDB connection string (set ✓)
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

## Security Integrations (December 1, 2025)
The following open-source security tools have been integrated:

### 1. Keycloak Authentication (`lib/security/keycloak-auth.ts`)
- SSO (Single Sign-On) support
- OAuth 2.0 / OpenID Connect
- MFA (Multi-Factor Authentication) ready
- Token validation and refresh
- Role-based access from Keycloak

### 2. Wazuh Threat Detection (`lib/security/threat-detector.ts`)
- Brute force attack detection
- Rate limiting and abuse prevention
- SQL injection and XSS detection
- Suspicious input pattern matching
- IP blocking capability
- Wazuh API integration for external SIEM

### 3. Grafana Loki Activity Logs (`lib/security/activity-logger.ts`)
- Structured logging with multiple levels
- Category-based filtering
- Loki-compatible output format
- Export to JSON/CSV
- Authentication and access event logging

### 4. Express Session Management (`lib/security/session-manager.ts`)
- Session creation and validation
- Concurrent session limits
- Session timeout and renewal
- User session tracking
- Automatic cleanup of expired sessions

### 5. Helmet.js Security Headers (`lib/security/helmet-config.ts`)
- Content Security Policy (CSP)
- XSS Protection
- HSTS (HTTP Strict Transport Security)
- Frame Options (clickjacking protection)
- Content-Type sniffing prevention

### Security API Endpoints
- `GET/PUT /api/security/settings` - Security configuration
- `GET/DELETE /api/security/logs` - Activity logs
- `GET/PUT /api/security/threats` - Threat management
- `GET/DELETE /api/security/sessions` - Session management
- `GET/PUT /api/security/auth-config` - Authentication config

## Setup Complete ✓

The application is now running in Replit! Here's what's ready:

### Frontend
- Running on http://localhost:5000 (Replit webview)
- Next.js 16 development server active
- All pages serving correctly

### Backend
- MongoDB Atlas connected via `MONGODB_URI`
- API routes ready (auth, users, events, analytics)
- All endpoints available for requests

### Next Steps to Use
1. **Create your first admin user:**
   - Use the Sign Up form to create an account
   - In MongoDB Atlas, update that user's role to `"admin"`:
     ```javascript
     db.users.updateOne(
       { email: "your@email.com" },
       { $set: { role: "admin" } }
     )
     ```
   - Or manually insert admin user via MongoDB console

2. **Login and explore**
   - Navigate to `/login`
   - Use the admin account to access dashboard and admin panel

### Optional: Populate Sample Data
To create sample events and analytics data, you can:
- Manually insert documents in MongoDB Atlas
- Use the API endpoints directly
- Implement the setup script for your MongoDB Atlas instance
