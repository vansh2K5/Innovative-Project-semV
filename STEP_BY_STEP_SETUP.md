# Step-by-Step Setup Instructions

Follow these steps exactly to get your EMS application running.

---

## ✅ Step 1: Check Prerequisites

Open PowerShell or Command Prompt and verify:

```bash
# Check Node.js (should be 18+)
node --version

# Check npm
npm --version
```

If Node.js is not installed, download from: https://nodejs.org/

---

## ✅ Step 2: Install MongoDB

### Option A: Download Installer (Recommended)

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0+)
   - Platform: Windows
   - Package: MSI
3. Click **Download**
4. Run the installer
5. Choose **Complete** installation
6. **Important:** Check "Install MongoDB as a Service"
7. Click **Install**
8. Wait for installation to complete

### Option B: Using Chocolatey

```bash
choco install mongodb
```

---

## ✅ Step 3: Verify MongoDB Installation

```bash
# Check MongoDB version
mongod --version

# Should show something like: db version v7.0.x
```

---

## ✅ Step 4: Start MongoDB

### Method 1: Using the provided script (Easiest)

```bash
cd c:\Innovative-Project-semV
scripts\start-mongodb.bat
```

### Method 2: Using Windows Services

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "MongoDB" in the list
4. Right-click and select "Start"

### Method 3: Command Line

```bash
net start MongoDB
```

---

## ✅ Step 5: Verify MongoDB is Running

```bash
# Open MongoDB shell
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/...
# Using MongoDB: 7.0.x

# Type 'exit' to quit
exit
```

If this works, MongoDB is running! ✅

---

## ✅ Step 6: Install Project Dependencies

```bash
cd c:\Innovative-Project-semV
npm install
```

This will install all required packages. Wait for it to complete.

---

## ✅ Step 7: Setup Database

Run the automated setup script:

```bash
npm run setup
```

You should see:
```
🚀 Starting MongoDB setup...
📡 Connecting to MongoDB...
✅ Connected to MongoDB successfully!
📦 Creating collections...
✅ Created collection: users
✅ Created collection: events
✅ Created collection: analytics
🔍 Creating indexes...
✅ Created unique index on users.email
✅ Created indexes on events collection
✅ Created indexes on analytics collection
👤 Creating sample admin user...
✅ Created admin user:
   Email: admin@ems.com
   Password: admin123
👤 Creating sample regular user...
✅ Created regular user:
   Email: user@ems.com
   Password: user123
📅 Creating sample events...
✅ Created 3 sample events
✨ MongoDB setup completed successfully!
```

---

## ✅ Step 8: Start the Application

```bash
npm run dev
```

You should see:
```
> ip@0.1.0 dev
> next dev

   ▲ Next.js 16.0.1 (Turbopack)
   - Local:        http://localhost:3000
   - Network:      http://xxx.xxx.xxx.xxx:3000

 ✓ Starting...
 ✓ Ready in 7.5s
```

---

## ✅ Step 9: Open the Application

1. Open your web browser
2. Go to: http://localhost:3000/login
3. You should see the beautiful login page with Aurora background

---

## ✅ Step 10: Login

### Test with Admin Account:
- **Email:** admin@ems.com
- **Password:** admin123

Click **Login**

You should be redirected to the Admin Panel! 🎉

### Or Test with Regular User:
- **Email:** user@ems.com
- **Password:** user123

This will redirect to the Home Page with Calendar.

---

## ✅ Step 11: Explore the Application

### Admin Panel Features:
- View total users
- View upcoming events
- Navigate to calendar
- Logout functionality

### Home Page Features:
- Full calendar view
- Today's events
- Upcoming events
- Create new events
- Month navigation

---

## 🎯 Quick Test Checklist

After setup, verify everything works:

- [ ] MongoDB is running (`mongosh` connects)
- [ ] Application starts without errors
- [ ] Can access login page (http://localhost:3000/login)
- [ ] Can login with admin@ems.com / admin123
- [ ] Redirects to admin panel after login
- [ ] Can see user count and events
- [ ] Can navigate to home page
- [ ] Calendar displays correctly
- [ ] Can logout
- [ ] Can login again

---

## 🔧 Common Issues and Solutions

### Issue 1: "MongoDB service not found"

**Solution:**
MongoDB is not installed or not installed as a service.

1. Reinstall MongoDB
2. Make sure to check "Install as Windows Service"
3. Or start manually: `mongod --dbpath "C:\data\db"`

### Issue 2: "Cannot connect to MongoDB"

**Solution:**
MongoDB is not running.

```bash
# Start the service
net start MongoDB

# Or check if it's running
mongosh
```

### Issue 3: "Port 3000 already in use"

**Solution:**
Another application is using port 3000.

```bash
# Kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- -p 3001
```

### Issue 4: "Module not found" errors

**Solution:**
Dependencies not installed properly.

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue 5: "Invalid credentials" when logging in

**Solution:**
Database not set up properly.

```bash
# Run setup again
npm run setup

# Or check if users exist
mongosh
use ems-db
db.users.find()
```

### Issue 6: Login page shows "An error occurred"

**Solution:**
Check browser console (F12) for detailed error.

Common causes:
1. MongoDB not running
2. Environment variables not set
3. API routes not working

**Fix:**
1. Verify `.env.local` exists
2. Restart the dev server
3. Check MongoDB is running

---

## 📱 What to Do Next

### 1. Create Your Own Account
- Click "Don't have an account? Sign Up" on login page
- Enter your details
- You'll be logged in automatically

### 2. Create Events
- Go to Home Page
- Click "Create Event" button
- Fill in event details
- View it on the calendar

### 3. Explore the API
- Check `API_DOCUMENTATION.md` for all endpoints
- Use Postman or curl to test APIs
- Build custom features

### 4. Customize the App
- Modify colors in Tailwind config
- Add new fields to models
- Create custom pages
- Add new features

---

## 🆘 Still Need Help?

### Check Documentation:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Backend details
- [QUICK_START.md](./QUICK_START.md) - Quick reference

### Check Logs:
1. **Browser Console:** Press F12, check Console tab
2. **Terminal:** Look at the terminal running `npm run dev`
3. **MongoDB Logs:** Check Windows Event Viewer

### Verify Setup:
```bash
# Check MongoDB
mongosh
use ems-db
db.users.find()
db.events.find()

# Check environment
cat .env.local

# Check if server is running
curl http://localhost:3000/api/auth/me
```

---

## ✨ Success!

If you've completed all steps and can login, congratulations! 🎉

Your EMS application is now fully functional with:
- ✅ MongoDB database
- ✅ User authentication
- ✅ Calendar system
- ✅ Analytics tracking
- ✅ Admin panel
- ✅ Beautiful UI

Enjoy building with EMS! 🚀
