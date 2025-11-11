# User Management System - Complete Guide

## ✅ Features Implemented

### **1. View All Users**
- List all registered users
- Shows name, email, role, and creation date
- Color-coded role badges (Admin = Purple, User = Blue)
- Scrollable list with beautiful UI

### **2. Create New Users**
- Admin can create users with custom credentials
- Set name, email, password, and role
- Password validation (minimum 6 characters)
- Email uniqueness check
- Success message shows credentials to share

### **3. Edit Users**
- Update user name
- Change user role (User ↔ Admin)
- Email is read-only (cannot be changed)
- Save/Cancel options

### **4. Delete Users**
- Remove users from system
- Confirmation dialog prevents accidents
- Success/error messages

---

## 🚀 How to Use

### **Access User Management:**
1. Login as admin (`admin@ems.com` / `admin123`)
2. Click "Users" button in sidebar
3. User Management modal opens

### **Create a New User:**
1. Click green "Create User" button
2. Fill in the form:
   - **Name:** Full name (e.g., "John Doe")
   - **Email:** Login email (e.g., "john@company.com")
   - **Password:** Secure password (min 6 chars)
   - **Role:** Select User or Admin
3. Click "Create User"
4. **IMPORTANT:** Copy the credentials from the alert!
5. Share credentials with the new user

### **Edit a User:**
1. Click blue Edit button (✏️) on user card
2. Modify name or role
3. Click green "Save" button
4. Or click "Cancel" to discard changes

### **Delete a User:**
1. Click red Delete button (🗑️) on user card
2. Confirm deletion in popup
3. User is removed from system

---

## 🔐 Login with Created User

After creating a user, they can login:

1. **Logout** from admin account
2. Go to **login page**
3. Enter the **email** you set
4. Enter the **password** you set
5. Click **Login**
6. User is logged in! ✅

---

## 📋 Example Workflow

### **Admin Creates User:**
```
Name: Jane Smith
Email: jane@company.com
Password: secure123
Role: User
```

### **Alert Shows:**
```
User created successfully!

Login Credentials:
Email: jane@company.com
Password: secure123

Please save these credentials.
```

### **User Logs In:**
```
1. Go to: http://localhost:3000/login
2. Email: jane@company.com
3. Password: secure123
4. Click Login
5. Success! User is logged in
```

---

## 🎯 User Roles

### **User Role:**
- Can view calendar
- Can create events
- Can view their own events
- Cannot access admin panel
- Cannot manage users

### **Admin Role:**
- All User permissions
- Access admin panel
- View all users
- Create new users
- Edit user details
- Delete users
- View analytics

---

## ⚠️ Important Notes

### **Email Cannot Be Changed:**
- Email is the unique identifier
- Used for login authentication
- Cannot be modified after creation
- If user needs new email, create new account

### **Password Security:**
- Minimum 6 characters required
- Passwords are hashed in database
- Admin sets initial password
- User should change it after first login (future feature)

### **Role Changes:**
- Admin can promote User to Admin
- Admin can demote Admin to User
- Changes take effect immediately
- User must re-login to see new permissions

---

## 🔧 Troubleshooting

### **Error: "User with this email already exists"**
- **Cause:** Email is already registered
- **Solution:** Use a different email address

### **Error: "Unauthorized"**
- **Cause:** Not logged in or token expired
- **Solution:** Logout and login again

### **Error: "Forbidden: Admin access required"**
- **Cause:** User account trying to access admin features
- **Solution:** Login with admin account

### **Error: "Password must be at least 6 characters"**
- **Cause:** Password too short
- **Solution:** Use a password with 6+ characters

### **User can't login with created credentials**
- **Check:** Email is correct (case-insensitive)
- **Check:** Password is correct (case-sensitive)
- **Check:** User account is active
- **Try:** Clear browser cache and try again

---

## 📊 User Management Modal Layout

```
┌────────────────────────────────────────────────────────────┐
│ 👥 User Management          [Create User] [X]              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Admin User                              [admin]     │   │
│ │ 📧 admin@ems.com                                    │   │
│ │ Created: Nov 10, 2025                               │   │
│ │                                    [Edit] [Delete]  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ John Doe                                [user]      │   │
│ │ 📧 john@company.com                                 │   │
│ │ Created: Nov 11, 2025                               │   │
│ │                                    [Edit] [Delete]  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Create User Form

```
┌────────────────────────────────────────────────────────────┐
│ ➕ Create New User                                    [X]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Full Name *                                                 │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ John Doe                                            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Email Address *                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ john@company.com                                    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ Password *                                                  │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ••••••••••••                                        │   │
│ └─────────────────────────────────────────────────────┘   │
│ Password must be at least 6 characters                      │
│                                                             │
│ Role *                                                      │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ User ▼                                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│        [Cancel]              [Create User]                  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### **Before Testing:**
- [ ] MongoDB is running
- [ ] Dev server is running (`npm run dev`)
- [ ] Logged in as admin

### **Test Create User:**
- [ ] Click "Users" in sidebar
- [ ] Click "Create User" button
- [ ] Fill in all fields
- [ ] Click "Create User"
- [ ] See success alert with credentials
- [ ] User appears in list

### **Test Login with New User:**
- [ ] Logout from admin
- [ ] Go to login page
- [ ] Enter new user email
- [ ] Enter new user password
- [ ] Click Login
- [ ] Successfully logged in

### **Test Edit User:**
- [ ] Login as admin
- [ ] Open User Management
- [ ] Click Edit on a user
- [ ] Change name or role
- [ ] Click Save
- [ ] Changes are saved

### **Test Delete User:**
- [ ] Login as admin
- [ ] Open User Management
- [ ] Click Delete on a user
- [ ] Confirm deletion
- [ ] User is removed

---

## 🎉 Summary

You now have a complete user management system where:

✅ **Admins can:**
- View all users
- Create new users with custom credentials
- Edit user names and roles
- Delete users
- See user creation dates

✅ **Created users can:**
- Login with their credentials
- Access the system based on their role
- Create and manage events
- View calendar

✅ **System features:**
- Secure authentication
- Role-based access control
- Email uniqueness validation
- Password hashing
- Error handling
- Success notifications

**Everything is working and ready to use!** 🚀

---

## 📞 Quick Reference

**Admin Login:**
- Email: `admin@ems.com`
- Password: `admin123`

**Default User Login:**
- Email: `user@ems.com`
- Password: `user123`

**Access User Management:**
1. Login as admin
2. Click "Users" in sidebar
3. Click "Create User" to add new users

**Test New User:**
1. Create user with custom credentials
2. Logout
3. Login with new credentials
4. Verify access works

---

**User Management System is Complete!** ✅
