# Complete Setup Guide for EMS

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install MongoDB

**Option A: Using Installer (Recommended)**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. Click Install

**Option B: Using Chocolatey**
```bash
choco install mongodb
```

### Step 2: Start MongoDB

**Option A: Using the batch script (Easiest)**
```bash
cd c:\Innovative-Project-semV
scripts\start-mongodb.bat
```

**Option B: Manual start**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### Step 3: Verify MongoDB is Running

```bash
# Test connection
mongosh

# You should see MongoDB shell. Type 'exit' to quit.
```

### Step 4: Setup Database and Create Users

```bash
# Run the setup script
node scripts\setup-mongodb.js
```

This will:
- ✅ Create the database and collections
- ✅ Create indexes for performance
- ✅ Create sample admin and user accounts
- ✅ Create sample events

**Test Credentials Created:**
- **Admin:** admin@ems.com / admin123
- **User:** user@ems.com / user123

### Step 5: Start the Application

```bash
npm run dev
```

### Step 6: Login

1. Open http://localhost:3000/login
2. Use one of the test credentials above
3. Enjoy! 🎉

---

## 🔧 Troubleshooting

### Problem: MongoDB won't start

**Solution 1: Check if MongoDB is installed**
```bash
mongod --version
```

If not found, install MongoDB from https://www.mongodb.com/try/download/community

**Solution 2: Create data directory**
```bash
mkdir C:\data\db
mongod --dbpath "C:\data\db"
```

**Solution 3: Check if port 27017 is in use**
```bash
netstat -ano | findstr :27017
```

### Problem: "Cannot connect to MongoDB"

**Check if MongoDB is running:**
```bash
mongosh
```

If connection fails:
1. Start MongoDB service: `net start MongoDB`
2. Or run manually: `mongod --dbpath "C:\data\db"`

### Problem: "User not found" or "Invalid credentials"

**Run the setup script again:**
```bash
node scripts\setup-mongodb.js
```

This will create the test users if they don't exist.

### Problem: Login page shows "An error occurred"

**Check these:**
1. MongoDB is running: `mongosh`
2. Environment variables are set: Check `.env.local` exists
3. Dependencies are installed: `npm install`
4. Check browser console (F12) for detailed errors

### Problem: "Module not found" errors

**Reinstall dependencies:**
```bash
rm -rf node_modules
npm install
```

---

## 📋 Manual MongoDB Setup (Alternative)

If the automated script doesn't work, you can set up manually:

### 1. Connect to MongoDB
```bash
mongosh
```

### 2. Create Database
```javascript
use ems-db
```

### 3. Create Admin User
```javascript
db.users.insertOne({
  email: "admin@ems.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  name: "Admin User",
  role: "admin",
  department: "Management",
  position: "System Administrator",
  joinedDate: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 4. Create Indexes
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.events.createIndex({ startDate: 1, endDate: 1 })
db.events.createIndex({ createdBy: 1 })
db.analytics.createIndex({ userId: 1, date: -1 })
```

---

## 🔐 Security Notes

### For Development:
- Default credentials are provided for testing
- JWT secret is in `.env.local`

### For Production:
1. **Change JWT Secret:**
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
2. **Use MongoDB Atlas:**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env.local`

3. **Remove test users:**
   ```javascript
   db.users.deleteMany({ email: { $in: ["admin@ems.com", "user@ems.com"] } })
   ```

4. **Enable authentication:**
   - Create MongoDB admin user
   - Enable authentication in MongoDB config
   - Update connection string with credentials

---

## 📊 Database Structure

### Collections:

**users**
- Stores user accounts
- Fields: email, password (hashed), name, role, department, position
- Indexes: email (unique)

**events**
- Stores calendar events and tasks
- Fields: title, description, dates, type, priority, status, location
- Indexes: startDate, endDate, createdBy, assignedTo

**analytics**
- Stores performance metrics
- Fields: userId, date, metrics, activities
- Indexes: userId + date, date

---

## 🧪 Testing the Setup

### 1. Test MongoDB Connection
```bash
mongosh
use ems-db
db.users.find()
```

### 2. Test API Endpoints

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@ems.com\",\"password\":\"admin123\"}"
```

**Get Users (need token from login):**
```bash
curl http://localhost:3000/api/users ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test Frontend
1. Go to http://localhost:3000/login
2. Login with: admin@ems.com / admin123
3. Should redirect to admin panel
4. Check calendar page for events

---

## 📝 Next Steps

1. **Customize the application:**
   - Modify user fields in `lib/models/User.ts`
   - Add custom event types in `lib/models/Event.ts`
   - Create custom analytics in `lib/models/Analytics.ts`

2. **Add more features:**
   - Email notifications
   - File uploads
   - Real-time updates with WebSockets
   - Advanced analytics charts

3. **Deploy to production:**
   - Use MongoDB Atlas for database
   - Deploy to Vercel or similar platform
   - Set up proper environment variables
   - Enable HTTPS

---

## 🆘 Still Having Issues?

1. **Check logs:**
   - Browser console (F12)
   - Terminal running `npm run dev`
   - MongoDB logs

2. **Verify versions:**
   ```bash
   node --version  # Should be 18+
   npm --version
   mongod --version  # Should be 5.0+
   ```

3. **Clean restart:**
   ```bash
   # Stop everything
   net stop MongoDB
   
   # Clear node modules
   rm -rf node_modules
   npm install
   
   # Start MongoDB
   net start MongoDB
   
   # Run setup
   node scripts\setup-mongodb.js
   
   # Start app
   npm run dev
   ```

4. **Check documentation:**
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
   - [BACKEND_SETUP.md](./BACKEND_SETUP.md)
   - [QUICK_START.md](./QUICK_START.md)

---

## ✅ Success Checklist

- [ ] MongoDB installed and running
- [ ] Database setup script completed
- [ ] `.env.local` file exists with correct values
- [ ] Dependencies installed (`npm install`)
- [ ] Application starts without errors (`npm run dev`)
- [ ] Can access login page (http://localhost:3000/login)
- [ ] Can login with test credentials
- [ ] Calendar shows sample events
- [ ] All buttons work (navigation, logout)

If all boxes are checked, you're ready to go! 🎉
