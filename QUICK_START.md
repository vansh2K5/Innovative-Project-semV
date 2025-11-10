# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install MongoDB (if not installed)

**Windows:**
```bash
# Download and install from: https://www.mongodb.com/try/download/community
# Or use chocolatey:
choco install mongodb
```

Start MongoDB:
```bash
net start MongoDB
```

### Step 2: Configure Environment

Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/ems-db
JWT_SECRET=my-secret-key-change-in-production
NODE_ENV=development
```

### Step 3: Install & Run

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

---

## 📝 First Steps

### 1. Create Your First User

**Option A: Via UI**
- Navigate to http://localhost:3000/login
- Click "Register" (if available) or use the API

**Option B: Via API**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User",
    "department": "Management"
  }'
```

### 2. Make User an Admin

```bash
mongosh
use ems-db
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
exit
```

### 3. Login

**Via UI:** Go to http://localhost:3000/login

**Via API:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the returned token for future requests!

---

## 🎯 Common Operations

### Create a User (Admin Only)

```javascript
// Frontend
import api from '@/lib/api';

const newUser = await api.users.create({
  email: 'john@example.com',
  password: 'password123',
  name: 'John Doe',
  department: 'Engineering',
  position: 'Developer'
});
```

```bash
# cURL
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "name": "John Doe",
    "department": "Engineering"
  }'
```

### Create an Event

```javascript
// Frontend
const event = await api.events.create({
  title: 'Team Meeting',
  description: 'Weekly sync',
  startDate: '2024-01-15T10:00:00Z',
  endDate: '2024-01-15T11:00:00Z',
  type: 'meeting',
  priority: 'high',
  assignedTo: ['userId1', 'userId2']
});
```

### Get Analytics Summary

```javascript
// Frontend
const summary = await api.analytics.getSummary({
  period: 'week' // or 'month', 'year'
});

console.log(summary.summary.totalTasksCompleted);
console.log(summary.summary.averageProductivityScore);
```

### List All Users (Admin)

```javascript
// Frontend
const { users, pagination } = await api.users.getAll({
  page: 1,
  limit: 10,
  search: 'john',
  role: 'user'
});
```

### Update User Profile

```javascript
// Frontend
const updated = await api.users.update('userId', {
  name: 'John Updated',
  department: 'Product',
  position: 'Senior Developer'
});
```

---

## 🔧 Troubleshooting

### MongoDB Not Starting

```bash
# Check if MongoDB is running
net start MongoDB

# If fails, try:
mongod --dbpath "C:\data\db"
```

### Can't Connect to Database

1. Check `.env.local` has correct `MONGODB_URI`
2. Verify MongoDB is running: `mongosh`
3. Check port 27017 is not blocked

### Login Not Working

1. Verify user exists: 
   ```bash
   mongosh
   use ems-db
   db.users.find({ email: "your@email.com" })
   ```
2. Check JWT_SECRET is set in `.env.local`
3. Clear browser localStorage and cookies

### API Returns 401 Unauthorized

1. Check token is being sent in Authorization header
2. Verify token hasn't expired (7 days)
3. Ensure JWT_SECRET matches between requests

---

## 📚 Next Steps

1. **Read Full Documentation**
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
   - [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detailed backend setup

2. **Explore the Code**
   - `app/api/` - API route handlers
   - `lib/models/` - Database models
   - `lib/api.ts` - Frontend API client

3. **Customize**
   - Add custom fields to models
   - Create new API endpoints
   - Build custom UI components

4. **Deploy**
   - Set up MongoDB Atlas for cloud database
   - Deploy to Vercel or your preferred platform
   - Configure production environment variables

---

## 💡 Tips

- **Use the Frontend API Client:** Import from `@/lib/api` for type-safe API calls
- **Check Browser Console:** Errors are logged for debugging
- **Use MongoDB Compass:** Visual tool for database management
- **Enable Hot Reload:** Changes auto-refresh in development mode
- **Test with Postman:** Import endpoints from API_DOCUMENTATION.md

---

## 🆘 Need Help?

1. Check error messages in:
   - Browser console (F12)
   - Terminal running `npm run dev`
   - MongoDB logs

2. Common fixes:
   - Restart dev server: `Ctrl+C` then `npm run dev`
   - Clear database: `db.dropDatabase()` in mongosh
   - Reinstall dependencies: `rm -rf node_modules && npm install`

3. Review documentation:
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
   - [BACKEND_SETUP.md](./BACKEND_SETUP.md)
   - [README.md](./README.md)
