# Backend Setup Guide

## Overview
This guide will help you set up the backend for the Employee Management System (EMS), including database configuration and API setup.

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)

## Installation Steps

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (recommended)
5. MongoDB will start automatically

#### Verify MongoDB Installation:
```bash
mongod --version
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env.local
```

2. Edit `.env.local` and update the following variables:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/ems-db

# JWT Secret Key (IMPORTANT: Change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development
```

**IMPORTANT:** Generate a secure JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install Dependencies

If you haven't already installed the dependencies:
```bash
npm install
```

The following packages are required for the backend:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `@types/bcryptjs` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

### 4. Start MongoDB

#### Windows:
If MongoDB is installed as a service, it should already be running. If not:
```bash
net start MongoDB
```

Or start manually:
```bash
mongod --dbpath "C:\data\db"
```

#### Verify MongoDB is Running:
```bash
mongosh
```

This should connect to your MongoDB instance. Type `exit` to quit.

### 5. Start the Application

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Database Structure

The application uses three main collections:

### Users Collection
Stores user account information:
- Email, password (hashed), name
- Role (admin/user)
- Department, position
- Account status and timestamps

### Events Collection
Stores calendar events and tasks:
- Title, description, dates
- Type, priority, status
- Creator and assigned users
- Location, reminders, recurrence

### Analytics Collection
Stores user performance metrics:
- Daily metrics (tasks, events, hours worked)
- Productivity scores
- Activity logs (login, logout, task completion)

## Initial Setup

### Create an Admin User

You can create an admin user by making a POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin",
    "department": "Management",
    "position": "System Administrator"
  }'
```

Or use the frontend registration (you'll need to manually update the role in MongoDB):

1. Register through the UI
2. Connect to MongoDB:
   ```bash
   mongosh
   ```
3. Update user role:
   ```javascript
   use ems-db
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## API Testing

### Using curl:

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Get Users (with token):**
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:

1. Import the API endpoints from `API_DOCUMENTATION.md`
2. Create a new environment with:
   - `base_url`: `http://localhost:3000/api`
   - `token`: (will be set after login)
3. Test the endpoints

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**

Solution:
1. Verify MongoDB is running:
   ```bash
   net start MongoDB
   ```
2. Check the connection string in `.env.local`
3. Ensure MongoDB is listening on port 27017

### JWT Token Issues

**Error: "Unauthorized"**

Solution:
1. Verify the token is being sent in the Authorization header
2. Check that JWT_SECRET matches in `.env.local`
3. Ensure the token hasn't expired (tokens expire after 7 days)

### Password Hashing Issues

**Error: "Invalid credentials" when password is correct**

Solution:
1. Ensure bcryptjs is properly installed
2. Check that the password is being hashed before saving (pre-save hook in User model)
3. Verify the comparePassword method is working

## Database Management

### View Data in MongoDB:

```bash
mongosh
use ems-db

# View all users
db.users.find().pretty()

# View all events
db.events.find().pretty()

# View analytics
db.analytics.find().pretty()

# Count documents
db.users.countDocuments()
```

### Clear Data:

```bash
mongosh
use ems-db

# Clear all users
db.users.deleteMany({})

# Clear all events
db.events.deleteMany({})

# Clear all analytics
db.analytics.deleteMany({})
```

### Backup Database:

```bash
mongodump --db=ems-db --out=./backup
```

### Restore Database:

```bash
mongorestore --db=ems-db ./backup/ems-db
```

## Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive information
2. **Use strong JWT secrets** - Generate random strings for production
3. **Enable HTTPS in production** - Use SSL/TLS certificates
4. **Implement rate limiting** - Prevent brute force attacks
5. **Validate all inputs** - Prevent injection attacks
6. **Use environment-specific configs** - Different settings for dev/prod

## Production Deployment

### Environment Variables for Production:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ems-db?retryWrites=true&w=majority
JWT_SECRET=<generated-secure-random-string>
NODE_ENV=production
```

### MongoDB Atlas (Cloud Database):

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user
4. Whitelist IP addresses
5. Get connection string and update `MONGODB_URI`

### Additional Production Considerations:

- Use MongoDB Atlas or managed MongoDB service
- Enable MongoDB authentication
- Set up database backups
- Monitor database performance
- Implement logging and error tracking
- Use connection pooling
- Enable database indexes for performance

## API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check MongoDB logs
4. Review application logs in the console
