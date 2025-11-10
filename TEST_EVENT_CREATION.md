# Quick Test Guide - Event Creation

## 🚀 Quick Start Test

### **Step 1: Make Sure MongoDB is Running**

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# If not running, start it
net start MongoDB
```

### **Step 2: Start Dev Server**

```bash
npm run dev
```

### **Step 3: Test Event Creation**

1. **Open browser:** http://localhost:3000
2. **Login as admin:**
   - Email: `admin@ems.com`
   - Password: `admin123`

3. **Click "Create Event" button**

4. **Fill in the form with VALID data:**
   ```
   Title: Team Meeting
   Description: Discuss Q4 goals
   Type: Meeting
   Priority: High
   Start Date: [Tomorrow's date]
   Start Time: 10:00
   End Date: [Tomorrow's date]
   End Time: 11:00
   Location: Conference Room A
   ```

5. **Click "Create Event"**

### **Expected Result:**
- ✅ Success message: "Event created successfully!"
- ✅ Modal closes after 1 second
- ✅ Event appears in calendar
- ✅ No errors in console

---

## 🔧 If It Doesn't Work

### **Check 1: MongoDB Connection**

Open browser console and check for errors like:
- "MongoServerError: connect ECONNREFUSED"
- "Failed to connect to MongoDB"

**Fix:** Make sure MongoDB is running:
```powershell
net start MongoDB
```

### **Check 2: Authentication**

Check browser console for:
- "Unauthorized"
- "401"

**Fix:** 
1. Clear browser cache and cookies
2. Logout and login again
3. Check that token is in localStorage (F12 → Application → Local Storage)

### **Check 3: Network Request**

Open DevTools → Network tab:
1. Look for POST request to `/api/events`
2. Check Status Code:
   - **201** = Success ✅
   - **400** = Validation error (check response)
   - **401** = Not authenticated
   - **500** = Server error (check server console)

### **Check 4: Server Console**

Look at your terminal where `npm run dev` is running:
- Any error messages?
- MongoDB connection errors?
- Validation errors?

---

## 🎯 Common Issues & Fixes

### **Issue 1: "Unauthorized" Error**

**Cause:** Token not being sent or expired

**Fix:**
```javascript
// Open browser console and run:
localStorage.getItem('token')  // Should show a token
localStorage.getItem('user')   // Should show user data

// If null, login again
```

### **Issue 2: "Validation failed" Error**

**Cause:** Missing required fields

**Fix:** Make sure you fill in:
- ✅ Title (required)
- ✅ Start Date (required)
- ✅ End Date (required)

### **Issue 3: "Internal server error"**

**Cause:** MongoDB not running or connection issue

**Fix:**
```powershell
# Check MongoDB status
Get-Service MongoDB

# Start if stopped
net start MongoDB

# Check connection in server console
# Should see: "MongoDB connected successfully"
```

### **Issue 4: Modal Doesn't Close**

**Cause:** JavaScript error or loading state stuck

**Fix:**
1. Check browser console for errors
2. Refresh page
3. Try again

---

## 🧪 Test with cURL (Alternative)

If UI doesn't work, test the API directly:

```bash
# 1. Login and save cookies
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@ems.com\",\"password\":\"admin123\"}" \
  -c cookies.txt \
  -v

# 2. Create event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"title\": \"Test Event\",
    \"description\": \"Test Description\",
    \"startDate\": \"2025-11-15T10:00:00.000Z\",
    \"endDate\": \"2025-11-15T11:00:00.000Z\",
    \"type\": \"meeting\",
    \"priority\": \"high\",
    \"location\": \"Test Location\"
  }" \
  -v
```

**Expected Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "...",
    "title": "Test Event",
    "startDate": "2025-11-15T10:00:00.000Z",
    "endDate": "2025-11-15T11:00:00.000Z",
    "type": "meeting",
    "priority": "high",
    "status": "scheduled",
    "createdBy": {
      "name": "Admin User",
      "email": "admin@ems.com"
    }
  }
}
```

**Status Code:** 201 Created

---

## ✅ Success Checklist

After creating an event, verify:

- ✅ Network tab shows 201 status
- ✅ Response contains event data
- ✅ Success message displayed
- ✅ Modal closes
- ✅ Event appears in calendar
- ✅ No console errors
- ✅ Can create another event

---

## 🆘 Still Not Working?

### **Debug Steps:**

1. **Check MongoDB:**
   ```powershell
   Get-Service MongoDB
   # Should show "Running"
   ```

2. **Check Server Console:**
   - Look for "MongoDB connected successfully"
   - Look for any error messages

3. **Check Browser Console:**
   - F12 → Console tab
   - Look for red error messages
   - Copy and share the error

4. **Check Network Tab:**
   - F12 → Network tab
   - Filter: XHR
   - Look at the POST /api/events request
   - Check Status Code and Response

5. **Verify Data:**
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('token'));
   console.log(localStorage.getItem('user'));
   ```

---

## 🎉 If It Works

You should see:
1. ✅ "Event created successfully!" message
2. ✅ Modal closes smoothly
3. ✅ Event appears in your calendar
4. ✅ Can view event details
5. ✅ Can create more events

**Congratulations! Event creation is working!** 🎊

---

## 📝 Quick Reference

**Valid Test Data:**
```json
{
  "title": "Team Meeting",
  "description": "Discuss Q4 goals",
  "startDate": "2025-11-15T10:00:00.000Z",
  "endDate": "2025-11-15T11:00:00.000Z",
  "type": "meeting",
  "priority": "high",
  "location": "Conference Room A",
  "isAllDay": false
}
```

**Admin Credentials:**
- Email: `admin@ems.com`
- Password: `admin123`

**User Credentials:**
- Email: `user@ems.com`
- Password: `user123`

---

## 🔥 Pro Tips

1. **Always fill required fields:** Title, Start Date, End Date
2. **Use future dates:** Don't use past dates for events
3. **Check MongoDB first:** Most issues are MongoDB not running
4. **Clear cache if weird:** Ctrl+Shift+Delete → Clear cache
5. **Use DevTools:** F12 is your friend for debugging

---

**Need more help?** Check the error message in browser console and share it!
