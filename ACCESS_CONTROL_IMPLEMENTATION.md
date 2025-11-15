# Access Control Implementation

## Overview
A comprehensive access control system has been implemented to manage user permissions across the application. This system allows administrators to granularly control what features each user can access.

## Features Implemented

### 1. Database Model
**File:** `lib/models/UserPermissions.ts`

A MongoDB model that stores user permissions with the following fields:
- `userId` - Reference to the user
- `canViewCalendar` - Permission to view calendar
- `canCreateEvents` - Permission to create events
- `canEditEvents` - Permission to edit events
- `canDeleteEvents` - Permission to delete events
- `canViewApplications` - Permission to access office applications
- `canManageUsers` - Permission to manage user accounts
- `canAccessSecurity` - Permission to access security features
- `updatedBy` - Reference to admin who last updated permissions
- Timestamps for tracking changes

### 2. Backend API
**File:** `app/api/permissions/route.ts`

RESTful API endpoints for managing permissions:

#### GET `/api/permissions?userId={userId}`
- Fetches permissions for a specific user
- Auto-creates default permissions based on user role if none exist
- Requires admin or securityadmin authentication

#### PUT `/api/permissions`
- Updates permissions for a user
- Body: `{ userId, canViewCalendar, canCreateEvents, ... }`
- Creates new permissions if they don't exist (upsert)
- Requires admin or securityadmin authentication

### 3. Frontend API Integration
**File:** `lib/api.ts`

Added `permissionsAPI` with methods:
- `get(userId)` - Fetch user permissions
- `update(userId, permissions)` - Update user permissions

### 4. Access Control Page
**File:** `app/access-control/page.tsx`

A full-featured UI for managing user permissions:

**Left Panel - User List:**
- Displays all users with their details
- Shows name, email, role, and creation date
- Click to select a user
- Scrollable list for many users
- Visual highlighting for selected user

**Right Panel - Permissions Management:**
- Shows selected user's current permissions
- Toggle switches for each permission type
- Visual indicators (green checkmark/red X)
- Save/Cancel buttons
- Loading states during API calls

**Features:**
- Real-time permission loading from database
- Fallback to role-based defaults if API fails
- Success/error notifications
- Consistent theme with Aurora background
- Protected route (admin/securityadmin only)

### 5. Permission Utilities
**File:** `lib/permissions.ts`

Helper functions for permission checking:
- `getDefaultPermissionsByRole(role)` - Get default permissions by role
- `hasPermission(permissions, permission)` - Check specific permission
- `isAdmin(role)` - Check if user is admin
- `canManageUsers(permissions, role)` - Check user management access
- `canAccessSecurity(permissions, role)` - Check security access
- `PERMISSION_DESCRIPTIONS` - Human-readable permission descriptions

## Permission Types

1. **View Calendar** - Access to calendar and events
2. **Create Events** - Ability to create new events
3. **Edit Events** - Ability to modify existing events
4. **Delete Events** - Ability to remove events
5. **View Applications** - Access to office applications
6. **Manage Users** - User account management
7. **Access Security** - Security settings and features

## Default Permissions by Role

### Admin
- ✅ All permissions enabled
- Full system access

### Security Admin
- ✅ View Calendar
- ✅ Create Events
- ✅ Edit Events
- ❌ Delete Events (restricted)
- ✅ View Applications
- ✅ Manage Users
- ✅ Access Security

### User
- ✅ View Calendar
- ✅ Create Events
- ❌ Edit Events (own events only)
- ❌ Delete Events
- ✅ View Applications
- ❌ Manage Users
- ❌ Access Security

## Navigation Flow

1. Security Dashboard → Click "Manage Access" button
2. Access Control Page → Select user from list
3. View/Edit Permissions → Toggle switches
4. Save Changes → Permissions updated in database

## Security Features

- **Authentication Required:** All endpoints verify JWT token
- **Role-Based Access:** Only admin/securityadmin can access
- **Audit Trail:** Tracks who updated permissions and when
- **Input Validation:** Validates all permission updates
- **Error Handling:** Graceful fallbacks and user-friendly messages

## Usage Example

```typescript
// Check if user can create events
import { hasPermission } from '@/lib/permissions';

const canCreate = hasPermission(userPermissions, 'canCreateEvents');
if (canCreate) {
  // Show create event button
}
```

## Database Schema

```typescript
{
  userId: ObjectId,
  canViewCalendar: Boolean,
  canCreateEvents: Boolean,
  canEditEvents: Boolean,
  canDeleteEvents: Boolean,
  canViewApplications: Boolean,
  canManageUsers: Boolean,
  canAccessSecurity: Boolean,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## API Response Format

### Success Response
```json
{
  "permissions": {
    "_id": "...",
    "userId": "...",
    "canViewCalendar": true,
    "canCreateEvents": true,
    "canEditEvents": false,
    "canDeleteEvents": false,
    "canViewApplications": true,
    "canManageUsers": false,
    "canAccessSecurity": false,
    "updatedBy": "...",
    "createdAt": "2025-11-15T...",
    "updatedAt": "2025-11-15T..."
  }
}
```

### Error Response
```json
{
  "error": "Unauthorized",
  "details": "Admin access required"
}
```

## Future Enhancements

1. **Permission Groups** - Create reusable permission templates
2. **Time-Based Permissions** - Temporary access grants
3. **Resource-Level Permissions** - Per-event or per-user permissions
4. **Permission History** - Track all permission changes
5. **Bulk Operations** - Update multiple users at once
6. **Permission Inheritance** - Department or team-based permissions

## Testing

To test the access control system:

1. Login as admin
2. Navigate to Security → Access Control
3. Select a user
4. Toggle permissions
5. Save changes
6. Verify permissions are persisted
7. Test with different user roles

## Notes

- Permissions are cached on the frontend for performance
- Changes take effect immediately after saving
- Default permissions are auto-created on first access
- Security admins cannot delete users but can manage permissions
- Regular users cannot access the access control page
