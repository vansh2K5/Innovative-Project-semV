# Setup Scripts

## Available Scripts

### 1. `start-mongodb.bat` (Windows)
Checks and starts MongoDB service on Windows.

**Usage:**
```bash
scripts\start-mongodb.bat
```

**What it does:**
- Checks if MongoDB service exists
- Starts MongoDB service
- Verifies connection
- Shows MongoDB version

### 2. `setup-mongodb.js`
Sets up the database, creates collections, indexes, and sample data.

**Usage:**
```bash
node scripts/setup-mongodb.js
# or
npm run setup
```

**What it does:**
- Creates `ems-db` database
- Creates collections: users, events, analytics
- Creates indexes for performance
- Creates sample admin user (admin@ems.com / admin123)
- Creates sample regular user (user@ems.com / user123)
- Creates sample events

**Requirements:**
- MongoDB must be running
- Node.js must be installed
- bcryptjs package must be installed

## Quick Start

### Windows:

1. **Start MongoDB:**
   ```bash
   scripts\start-mongodb.bat
   ```

2. **Setup Database:**
   ```bash
   npm run setup
   ```

3. **Start Application:**
   ```bash
   npm run dev
   ```

### Manual Setup:

If scripts don't work, follow these steps:

1. **Start MongoDB manually:**
   ```bash
   net start MongoDB
   # or
   mongod --dbpath "C:\data\db"
   ```

2. **Run setup script:**
   ```bash
   node scripts/setup-mongodb.js
   ```

3. **Verify setup:**
   ```bash
   mongosh
   use ems-db
   db.users.find()
   ```

## Troubleshooting

### MongoDB service not found
- Install MongoDB from https://www.mongodb.com/try/download/community
- Make sure to install it as a Windows Service

### Cannot connect to MongoDB
- Check if MongoDB is running: `mongosh`
- Start service: `net start MongoDB`
- Check port 27017 is not blocked

### Setup script fails
- Make sure MongoDB is running first
- Check if bcryptjs is installed: `npm list bcryptjs`
- Try running with admin privileges

## Test Credentials

After running setup, you can login with:

**Admin Account:**
- Email: admin@ems.com
- Password: admin123
- Role: admin

**Regular User:**
- Email: user@ems.com  
- Password: user123
- Role: user

## Notes

- Scripts are safe to run multiple times
- Existing data won't be deleted
- Duplicate users will be skipped
- Indexes will be created if they don't exist
