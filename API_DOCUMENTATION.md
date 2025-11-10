# EMS API Documentation

## Overview
This document describes the REST API endpoints for the Employee Management System (EMS).

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

Alternatively, the token is automatically stored in an HTTP-only cookie after login.

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user",
  "department": "Engineering",
  "position": "Developer"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "department": "Engineering",
    "position": "Developer",
    "joinedDate": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/login
Login to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "department": "Engineering",
    "position": "Developer",
    "joinedDate": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/logout
Logout from the current session.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "department": "Engineering",
    "position": "Developer"
  }
}
```

---

## User Management Endpoints

### GET /api/users
Get all users (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name, email, or department
- `role` (string): Filter by role (admin/user)
- `isActive` (boolean): Filter by active status

**Response (200):**
```json
{
  "users": [
    {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "department": "Engineering",
      "position": "Developer",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### POST /api/users
Create a new user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "user",
  "department": "Marketing",
  "position": "Manager"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "userId",
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "role": "user",
    "department": "Marketing",
    "position": "Manager"
  }
}
```

### GET /api/users/[id]
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "department": "Engineering",
    "position": "Developer"
  }
}
```

### PUT /api/users/[id]
Update a user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "department": "Product",
  "position": "Senior Developer",
  "role": "admin",
  "isActive": true
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "John Updated",
    "department": "Product",
    "position": "Senior Developer"
  }
}
```

### DELETE /api/users/[id]
Delete a user (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Calendar Events Endpoints

### GET /api/events
Get all events.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `startDate` (ISO date): Filter events starting from this date
- `endDate` (ISO date): Filter events ending before this date
- `type` (string): Filter by type (meeting/deadline/task/reminder/other)
- `status` (string): Filter by status (pending/in-progress/completed/cancelled)
- `priority` (string): Filter by priority (low/medium/high)

**Response (200):**
```json
{
  "events": [
    {
      "id": "eventId",
      "title": "Team Meeting",
      "description": "Weekly sync",
      "startDate": "2024-01-15T10:00:00.000Z",
      "endDate": "2024-01-15T11:00:00.000Z",
      "type": "meeting",
      "priority": "high",
      "status": "pending",
      "createdBy": {
        "id": "userId",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": [],
      "location": "Conference Room A",
      "isAllDay": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### POST /api/events
Create a new event.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-15T11:00:00.000Z",
  "type": "meeting",
  "priority": "high",
  "status": "pending",
  "assignedTo": ["userId1", "userId2"],
  "location": "Conference Room A",
  "isAllDay": false,
  "reminders": [
    {
      "type": "email",
      "minutesBefore": 30
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": "eventId",
    "title": "Team Meeting",
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-01-15T11:00:00.000Z",
    "type": "meeting",
    "priority": "high",
    "status": "pending"
  }
}
```

### GET /api/events/[id]
Get a specific event by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "event": {
    "id": "eventId",
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-01-15T11:00:00.000Z",
    "type": "meeting",
    "priority": "high",
    "status": "pending"
  }
}
```

### PUT /api/events/[id]
Update an event.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Meeting",
  "status": "completed",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "message": "Event updated successfully",
  "event": {
    "id": "eventId",
    "title": "Updated Meeting",
    "status": "completed",
    "priority": "medium"
  }
}
```

### DELETE /api/events/[id]
Delete an event.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Event deleted successfully"
}
```

---

## Analytics Endpoints

### GET /api/analytics
Get analytics data for a user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `userId` (string): User ID (optional, defaults to current user)
- `startDate` (ISO date): Start date for analytics
- `endDate` (ISO date): End date for analytics
- `limit` (number): Number of days to return (default: 30)

**Response (200):**
```json
{
  "analytics": [
    {
      "id": "analyticsId",
      "userId": "userId",
      "date": "2024-01-15T00:00:00.000Z",
      "metrics": {
        "tasksCompleted": 5,
        "tasksCreated": 3,
        "eventsAttended": 2,
        "hoursWorked": 8,
        "productivityScore": 85
      },
      "activities": [
        {
          "type": "login",
          "timestamp": "2024-01-15T09:00:00.000Z"
        },
        {
          "type": "task_completed",
          "timestamp": "2024-01-15T10:30:00.000Z",
          "metadata": {
            "eventId": "eventId",
            "eventTitle": "Complete Report"
          }
        }
      ]
    }
  ]
}
```

### POST /api/analytics
Create or update analytics data.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "metrics": {
    "tasksCompleted": 5,
    "hoursWorked": 8,
    "productivityScore": 85
  },
  "activity": {
    "type": "task_completed",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "metadata": {
      "eventId": "eventId"
    }
  }
}
```

**Response (200):**
```json
{
  "message": "Analytics updated successfully",
  "analytics": {
    "id": "analyticsId",
    "userId": "userId",
    "date": "2024-01-15T00:00:00.000Z",
    "metrics": {
      "tasksCompleted": 5,
      "hoursWorked": 8,
      "productivityScore": 85
    }
  }
}
```

### GET /api/analytics/summary
Get analytics summary for a period.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `userId` (string): User ID (optional, defaults to current user)
- `period` (string): Time period (week/month/year, default: week)

**Response (200):**
```json
{
  "summary": {
    "totalTasksCompleted": 35,
    "totalTasksCreated": 28,
    "totalEventsAttended": 14,
    "totalHoursWorked": 56,
    "averageProductivityScore": 82,
    "totalActivities": 150,
    "activityBreakdown": {
      "login": 7,
      "logout": 7,
      "task_created": 28,
      "task_completed": 35,
      "event_created": 10,
      "event_attended": 14
    },
    "dailyMetrics": [
      {
        "date": "2024-01-15T00:00:00.000Z",
        "tasksCompleted": 5,
        "tasksCreated": 4,
        "eventsAttended": 2,
        "hoursWorked": 8,
        "productivityScore": 85,
        "activitiesCount": 22
      }
    ]
  },
  "period": "week",
  "startDate": "2024-01-08T00:00:00.000Z",
  "endDate": "2024-01-15T23:59:59.999Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Data Models

### User
```typescript
{
  _id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: 'admin' | 'user';
  department?: string;
  position?: string;
  joinedDate: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Event
```typescript
{
  _id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'meeting' | 'deadline' | 'task' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: ObjectId;
  assignedTo: ObjectId[];
  location?: string;
  isAllDay: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  reminders: {
    type: 'email' | 'notification';
    minutesBefore: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Analytics
```typescript
{
  _id: string;
  userId: ObjectId;
  date: Date;
  metrics: {
    tasksCompleted: number;
    tasksCreated: number;
    eventsAttended: number;
    hoursWorked: number;
    productivityScore: number; // 0-100
  };
  activities: {
    type: 'login' | 'logout' | 'task_created' | 'task_completed' | 'event_created' | 'event_attended';
    timestamp: Date;
    metadata?: Record<string, any>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Setup Instructions

1. **Install MongoDB** (if not already installed)
   - Download from https://www.mongodb.com/try/download/community
   - Start MongoDB service

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure random string

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Test the API**
   - Use tools like Postman or curl to test endpoints
   - First register a user, then login to get a token
   - Use the token for authenticated requests

---

## Notes

- All dates should be in ISO 8601 format
- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- Admin users have access to all endpoints
- Regular users can only access their own data (except for events they're assigned to)
