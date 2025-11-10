# 🔥 DEBUG EVENT CREATION - DO THIS NOW

## Step 1: Your server is running on PORT 3001 (not 3000)

**Go to:** http://localhost:3001

## Step 2: Open Browser Console

**Press F12** → Console tab

## Step 3: Try to Create Event

1. Login as admin (`admin@ems.com` / `admin123`)
2. Click "Create Event"
3. Fill in:
   - Title: Test Event
   - Start Date: Pick any date
   - End Date: Same or later date
4. Click "Create Event"

## Step 4: Check Console Logs

You will see detailed logs like:

```
Sending event data: { title: "Test Event", startDate: "...", ... }
Title: Test Event
StartDate: 2025-11-15T10:00:00.000Z
EndDate: 2025-11-15T11:00:00.000Z
```

**AND in your terminal (where npm run dev is running):**

```
=== EVENT CREATION REQUEST ===
Received body: { ... }
Title: Test Event
StartDate: 2025-11-15T10:00:00.000Z
EndDate: 2025-11-15T11:00:00.000Z
=============================
```

## Step 5: Look for the Problem

### If you see in terminal:
```
VALIDATION FAILED:
  title: undefined
  startDate: undefined
  endDate: undefined
```

**This means the data is NOT reaching the server properly.**

### If you see in browser console:
```
Error serverMessage: Title, start date, and end date are required
```

**This means the server is rejecting the data.**

## Step 6: Share the Logs

Copy and paste:
1. **Browser console output** (everything after clicking Create Event)
2. **Terminal output** (from your npm run dev window)

---

## Quick Checks:

### ✅ Is MongoDB Running?
```powershell
Get-Service MongoDB
```
Should say "Running"

### ✅ Are you on the right port?
**Use:** http://localhost:3001 (NOT 3000)

### ✅ Are you logged in?
Check browser console:
```javascript
localStorage.getItem('token')  // Should show a token
```

---

## What I Added:

1. **Client-side logging** - Shows exactly what data is being sent
2. **Server-side logging** - Shows exactly what data is received
3. **Detailed error logging** - Shows exactly what went wrong

**Now try creating an event and share the console output!**

The logs will tell us EXACTLY where the problem is.
