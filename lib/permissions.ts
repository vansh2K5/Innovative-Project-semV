// Permission checking utilities

export interface UserPermissions {
  canViewCalendar: boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewApplications: boolean;
  canManageUsers: boolean;
  canAccessSecurity: boolean;
}

// Get default permissions based on user role
export function getDefaultPermissionsByRole(role: string): UserPermissions {
  switch (role) {
    case 'admin':
      return {
        canViewCalendar: true,
        canCreateEvents: true,
        canEditEvents: true,
        canDeleteEvents: true,
        canViewApplications: true,
        canManageUsers: true,
        canAccessSecurity: true,
      };
    case 'securityadmin':
      return {
        canViewCalendar: true,
        canCreateEvents: true,
        canEditEvents: true,
        canDeleteEvents: false,
        canViewApplications: true,
        canManageUsers: true,
        canAccessSecurity: true,
      };
    default: // user
      return {
        canViewCalendar: true,
        canCreateEvents: true,
        canEditEvents: false,
        canDeleteEvents: false,
        canViewApplications: true,
        canManageUsers: false,
        canAccessSecurity: false,
      };
  }
}

// Check if user has a specific permission
export function hasPermission(
  permissions: UserPermissions | null,
  permission: keyof UserPermissions
): boolean {
  if (!permissions) return false;
  return permissions[permission] === true;
}

// Check if user has admin-level access
export function isAdmin(role: string): boolean {
  return role === 'admin' || role === 'securityadmin';
}

// Check if user can manage other users
export function canManageUsers(permissions: UserPermissions | null, role: string): boolean {
  if (isAdmin(role)) return true;
  return hasPermission(permissions, 'canManageUsers');
}

// Check if user can access security features
export function canAccessSecurity(permissions: UserPermissions | null, role: string): boolean {
  if (isAdmin(role)) return true;
  return hasPermission(permissions, 'canAccessSecurity');
}

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<keyof UserPermissions, string> = {
  canViewCalendar: 'View calendar and events',
  canCreateEvents: 'Create new events',
  canEditEvents: 'Edit existing events',
  canDeleteEvents: 'Delete events',
  canViewApplications: 'Access office applications',
  canManageUsers: 'Manage user accounts',
  canAccessSecurity: 'Access security settings',
};
