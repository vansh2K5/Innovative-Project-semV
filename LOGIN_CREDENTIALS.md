# 🔐 Login Credentials

## Default Users

Your platform has **2 default users** already created in the database:

### 1. **Admin Account** (Full Access)
```
Email:    admin@ems.com
Password: admin123
Role:     Admin
```

**Admin Permissions:**
- ✅ Access admin panel
- ✅ View all users
- ✅ Create/edit/delete users
- ✅ Create/edit/delete events
- ✅ View analytics
- ✅ Full system access

---

### 2. **Regular User Account** (Limited Access)
```
Email:    user@ems.com
Password: user123
Role:     User
```

**User Permissions:**
- ✅ View calendar
- ✅ Create events
- ✅ View their own events
- ❌ Cannot access admin panel
- ❌ Cannot manage users

---

## How to Login

1. **Open the application**: http://localhost:3000
2. **Navigate to login page**: Click "Login" or go to http://localhost:3000/login
3. **Enter credentials**:
   - Email: `admin@ems.com` (for admin access)
   - Password: `admin123`
4. **Click "Login"**
5. **You're in!** ✅

---

## Creating Additional Users

Once logged in as admin:

1. Click **"Users"** button in the sidebar
2. Click **"Create User"** (green button)
3. Fill in the form:
   - Name
   - Email
   - Password (min 6 characters)
   - Role (User or Admin)
4. Click **"Create User"**
5. **Save the credentials** shown in the alert
6. Share credentials with the new user

---

## Database Information

- **Database**: `ems-db`
- **Connection**: `mongodb://localhost:27017/ems-db`
- **Collections**: users, events, analytics

---

## Setup Script

If you need to recreate the default users, run:
```bash
npm run setup
```

This will:
- Create database collections
- Create indexes
- Add default admin and user accounts
- Add sample events

---

## ⚠️ Security Notes

**IMPORTANT:** These are default credentials for development only!

For production:
1. Change all default passwords
2. Update JWT_SECRET in .env.local
3. Use strong, unique passwords
4. Enable password change on first login
5. Consider adding 2FA

---

## Quick Test

**Test Admin Login:**
```
1. Go to: http://localhost:3000/login
2. Email: admin@ems.com
3. Password: admin123
4. Should see admin dashboard with sidebar
```

**Test User Login:**
```
1. Logout from admin
2. Go to: http://localhost:3000/login
3. Email: user@ems.com
4. Password: user123
5. Should see calendar view (no admin panel)
```

---

## Troubleshooting

**Can't login?**
- ✅ Check MongoDB is running
- ✅ Check .env.local has correct MONGODB_URI
- ✅ Run `npm run setup` to create users
- ✅ Check browser console for errors
- ✅ Clear browser cache/cookies

**"Invalid credentials" error?**
- Email is case-insensitive
- Password is case-sensitive
- Make sure no extra spaces
- Try copy-pasting credentials

**"Unauthorized" error?**
- Token may have expired
- Clear cookies and login again
- Check JWT_SECRET in .env.local

---

## Current Status

✅ **Application is running**: http://localhost:3000
✅ **MongoDB configured**: mongodb://localhost:27017/ems-db
✅ **Default users available**: admin@ems.com & user@ems.com
✅ **Ready to login and test!**

---

**Start by logging in as admin to explore all features!** 🚀
