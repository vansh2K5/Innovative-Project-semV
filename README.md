# Employee Management System (EMS)

A modern, full-stack employee management system built with Next.js, MongoDB, and TypeScript. This application provides comprehensive user management, calendar/event tracking, and performance analytics.

## Features

- 🔐 **Authentication & Authorization**
  - Secure login/logout with JWT tokens
  - Role-based access control (Admin/User)
  - Password hashing with bcrypt

- 👥 **User Management**
  - Create, read, update, and delete users
  - User profiles with department and position
  - Admin dashboard for user oversight

- 📅 **Calendar & Events**
  - Create and manage events, meetings, tasks, and deadlines
  - Event assignment to multiple users
  - Priority levels and status tracking
  - Recurring events support
  - Event reminders

- 📊 **Performance Analytics**
  - Track tasks completed and created
  - Monitor hours worked and productivity scores
  - Activity logging (login, logout, task completion)
  - Daily, weekly, monthly, and yearly summaries
  - Visual analytics dashboard

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **UI Components:** Radix UI, Lucide Icons, GSAP animations

## Getting Started

### 🚀 Quick Setup (3 Commands)

```bash
# 1. Install dependencies
npm install

# 2. Setup MongoDB (creates database, users, and sample data)
npm run setup

# 3. Start the application
npm run dev
```

Then open http://localhost:3000/login

**Test Credentials:**
- Admin: `admin@ems.com` / `admin123`
- User: `user@ems.com` / `user123`

### 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+ (see installation below)
- npm or yarn

### 🔧 Detailed Installation

#### 1. Install MongoDB

**Windows:**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Run installer, choose "Complete" installation
- Check "Install MongoDB as a Service"
- Or use script: `scripts\start-mongodb.bat`

**Verify installation:**
```bash
mongod --version
mongosh  # Should connect successfully
```

#### 2. Install Project Dependencies

```bash
npm install
```

#### 3. Setup Database

The automated setup script will:
- Create database and collections
- Create indexes
- Create admin and user accounts
- Add sample events

```bash
npm run setup
```

#### 4. Start Application

```bash
npm run dev
```

#### 5. Login

Open http://localhost:3000/login and use:
- **Admin:** admin@ems.com / admin123
- **User:** user@ems.com / user123

### 📚 Setup Guides

- **[STEP_BY_STEP_SETUP.md](./STEP_BY_STEP_SETUP.md)** - Detailed walkthrough with screenshots
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup guide with troubleshooting
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User management endpoints
│   │   ├── events/       # Calendar events endpoints
│   │   └── analytics/    # Analytics endpoints
│   ├── login/            # Login page
│   ├── homePage/         # User dashboard
│   └── adminUi/          # Admin dashboard
├── lib/
│   ├── models/           # MongoDB models
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   └── Analytics.ts
│   ├── db.ts             # Database connection
│   ├── auth.ts           # Authentication utilities
│   ├── api.ts            # Frontend API client
│   └── useAuth.ts        # Authentication hook
├── components/           # React components
└── public/              # Static files
```

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Reference

- **Authentication**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login
  - `POST /api/auth/logout` - Logout
  - `GET /api/auth/me` - Get current user

- **Users** (Admin only)
  - `GET /api/users` - Get all users
  - `POST /api/users` - Create user
  - `GET /api/users/[id]` - Get user by ID
  - `PUT /api/users/[id]` - Update user
  - `DELETE /api/users/[id]` - Delete user

- **Events**
  - `GET /api/events` - Get all events
  - `POST /api/events` - Create event
  - `GET /api/events/[id]` - Get event by ID
  - `PUT /api/events/[id]` - Update event
  - `DELETE /api/events/[id]` - Delete event

- **Analytics**
  - `GET /api/analytics` - Get analytics data
  - `POST /api/analytics` - Update analytics
  - `GET /api/analytics/summary` - Get analytics summary

## Backend Setup

For detailed backend setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)

## Usage

### Creating an Admin User

1. Register through the UI or API
2. Connect to MongoDB and update the user role:
   ```bash
   mongosh
   use ems-db
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

### Using the API

```javascript
import api from '@/lib/api';

// Login
const { user, token } = await api.auth.login('user@example.com', 'password');

// Create event
const event = await api.events.create({
  title: 'Team Meeting',
  startDate: '2024-01-15T10:00:00Z',
  endDate: '2024-01-15T11:00:00Z',
  type: 'meeting',
  priority: 'high'
});

// Get analytics summary
const summary = await api.analytics.getSummary({ period: 'week' });
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- HTTP-only cookies for token storage
- Role-based access control
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Review [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- Open an issue on GitHub
