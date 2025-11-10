# 📥 MongoDB Installation Instructions

## 🌐 Download Page is Now Open

The MongoDB download page should be open in your browser. If not, go to:
**https://www.mongodb.com/try/download/community**

---

## 📋 Step-by-Step Installation

### **Step 1: Download MongoDB**

On the download page, select:
- **Version:** 7.0.14 (or latest)
- **Platform:** Windows
- **Package:** msi

Click the green **Download** button.

### **Step 2: Run the Installer**

1. Locate the downloaded file (usually in Downloads folder)
2. File name will be like: `mongodb-windows-x86_64-7.0.14-signed.msi`
3. **Double-click** to run the installer
4. Click **Next** when the setup wizard opens

### **Step 3: Accept License**

1. Check "I accept the terms in the License Agreement"
2. Click **Next**

### **Step 4: Choose Setup Type**

1. Select **Complete** (recommended)
2. Click **Next**

### **Step 5: Service Configuration (IMPORTANT!)**

This is the most important step:

1. You'll see "Service Configuration" screen
2. **Make sure these are checked:**
   - ✅ **Install MongoDB as a Service**
   - ✅ Run service as Network Service user
   - Service Name: MongoDB
   - Data Directory: C:\Program Files\MongoDB\Server\7.0\data\
   - Log Directory: C:\Program Files\MongoDB\Server\7.0\log\

3. Click **Next**

### **Step 6: Install MongoDB Compass (Optional)**

1. You can uncheck "Install MongoDB Compass" if you don't need the GUI
2. Click **Next**

### **Step 7: Install**

1. Click **Install**
2. Wait for installation (may take 2-5 minutes)
3. Click **Finish** when done

---

## ✅ Verify Installation

### **Method 1: Using the Batch File**

Simply double-click:
```
INSTALL_MONGODB.bat
```

This will verify and start MongoDB for you.

### **Method 2: Manual Verification**

Open a **NEW** Command Prompt or PowerShell and run:

```bash
# Check version
mongod --version

# Should show something like:
# db version v7.0.14
```

If you see the version, MongoDB is installed! ✅

---

## 🚀 Start MongoDB

### **Method 1: Automatic (Service)**

If you installed as a service, it should start automatically.

Verify it's running:
```bash
net start MongoDB
```

### **Method 2: Check Windows Services**

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Look for "MongoDB" in the list
4. Status should be "Running"
5. If not, right-click and select "Start"

### **Method 3: Manual Start**

If service isn't working:
```bash
mongod --dbpath "C:\data\db"
```

(Keep this window open)

---

## 🧪 Test MongoDB Connection

Open a new terminal and run:
```bash
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/...
Using MongoDB: 7.0.14
```

Type `exit` to quit.

If this works, MongoDB is ready! ✅

---

## 🎯 Next Steps (After MongoDB is Running)

### **1. Setup the Database**
```bash
npm run setup
```

This will:
- Create the database
- Create collections
- Add test users
- Add sample events

### **2. Start the Application**
```bash
npm run dev
```

### **3. Open the App**
Go to: http://localhost:3000/login

**Login with:**
- Email: `admin@ems.com`
- Password: `admin123`

---

## 🔧 Troubleshooting

### Problem: "mongod is not recognized"

**Solution:**
1. Close your current terminal
2. Open a **NEW** terminal (this loads the updated PATH)
3. Try again

If still not working:
1. Add MongoDB to PATH manually:
   - Search for "Environment Variables" in Windows
   - Edit "Path" in System Variables
   - Add: `C:\Program Files\MongoDB\Server\7.0\bin`
   - Click OK
   - Restart terminal

### Problem: "Service failed to start"

**Solution:**
1. Create data directory:
   ```bash
   mkdir C:\data\db
   ```

2. Try starting manually:
   ```bash
   mongod --dbpath "C:\data\db"
   ```

3. Or reinstall MongoDB and make sure to check "Install as Service"

### Problem: Port 27017 already in use

**Solution:**
Another MongoDB instance might be running.

1. Check running processes:
   ```bash
   netstat -ano | findstr :27017
   ```

2. Kill the process:
   ```bash
   taskkill /PID <PID_NUMBER> /F
   ```

3. Start MongoDB again

---

## 📞 Need More Help?

Check these guides:
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup guide
- **[STEP_BY_STEP_SETUP.md](./STEP_BY_STEP_SETUP.md)** - Detailed walkthrough
- **[MONGODB_SETUP_COMPLETE.md](./MONGODB_SETUP_COMPLETE.md)** - Quick reference

---

## ✨ Installation Checklist

- [ ] Downloaded MongoDB MSI installer
- [ ] Ran the installer
- [ ] Selected "Complete" installation
- [ ] Checked "Install MongoDB as a Service"
- [ ] Installation completed successfully
- [ ] Opened new terminal
- [ ] `mongod --version` shows version
- [ ] `mongosh` connects successfully
- [ ] MongoDB service is running
- [ ] Ready to run `npm run setup`

Once all boxes are checked, you're ready to go! 🚀
