# 🔐 Sample Admin Credentials

## Created Sample Users for Testing

### 🌟 SUPER ADMIN
```
Email:    superadmin@ems.com
Password: super123
Role:     Super Admin
```

**Capabilities:**
- ✅ Full system access
- ✅ Can create/edit/delete all user types
- ✅ Can assign any role (including Super Admin)
- ✅ Access to Security Management page
- ✅ Can delete any user (except self)
- ✅ Highest privilege level

---

### 🛡️ SECURITY ADMIN
```
Email:    securityadmin@ems.com
Password: security123
Role:     Security Admin
```

**Capabilities:**
- ✅ Can create/edit users (Admin, Security Admin, User)
- ✅ Access to Security Management page
- ✅ Can view all users
- ❌ **CANNOT delete any users**
- ❌ **CANNOT assign Super Admin role**
- ✅ Second-highest privilege level

---

### 👤 EXISTING ADMIN (Already Created)
```
Email:    admin@ems.com
Password: admin123
Role:     Admin
```

**Capabilities:**
- ✅ Can create/edit users (Admin, User only)
- ✅ Can delete regular Admins and Users
- ❌ **CANNOT delete Super Admins**
- ❌ **CANNOT delete Security Admins**
- ❌ **CANNOT modify Super/Security Admins**
- ❌ No access to Security page

---

## 🚀 How to Create These Users

### Option 1: Run the Seed Script
```bash
node scripts/createSampleAdmins.js
```

### Option 2: Create Manually via Admin UI
1. Login as existing admin (`admin@ems.com` / `admin123`)
2. Go to Admin Home
3. Click "User Management"
4. Click "Create User"
5. Fill in the details above
6. Select appropriate role
7. Create the user

**Note:** Regular admins cannot create Super Admins, so you'll need to:
- First create a Super Admin using the seed script OR
- Manually update an existing user's role in the database

---

## 📊 Role Hierarchy

```
Super Admin (superadmin)
    ↓ Can manage everyone
Security Admin (securityadmin)
    ↓ Can manage admins & users (no delete)
Admin (admin)
    ↓ Can manage users & admins (limited)
User (user)
    ↓ Basic access
```

---

## 🔒 Security Notes

- **Change these passwords** in production!
- These are sample credentials for **development/testing only**
- Super Admin has the highest privileges - protect this account
- Security Admin cannot delete users (by design)
- Regular Admins cannot modify higher-tier roles

---

## 🧪 Testing Scenarios

### Test Super Admin:
1. Login with `superadmin@ems.com` / `super123`
2. Navigate to Security page (should be visible)
3. Create a new Super Admin (should work)
4. Delete any user (should work, except self)

### Test Security Admin:
1. Login with `securityadmin@ems.com` / `security123`
2. Navigate to Security page (should be visible)
3. Try to delete a user (button should be disabled)
4. Try to create Super Admin (option should not appear)

### Test Admin:
1. Login with `admin@ems.com` / `admin123`
2. Try to access Security page (should not see link)
3. Try to delete Super Admin (button should be disabled)
4. Try to delete Security Admin (button should be disabled)

---

## 📝 Quick Reference

| Credential | Email | Password | Role | Security Page |
|------------|-------|----------|------|---------------|
| Super Admin | superadmin@ems.com | super123 | superadmin | ✅ Yes |
| Security Admin | securityadmin@ems.com | security123 | securityadmin | ✅ Yes |
| Admin | admin@ems.com | admin123 | admin | ❌ No |

---

**Remember to run the seed script to create these users in your database!**

```bash
node scripts/createSampleAdmins.js
```
