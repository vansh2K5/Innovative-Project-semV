import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserPermissions from '@/lib/models/UserPermissions';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get permissions for a specific user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin or securityadmin
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'securityadmin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get permissions for the user
    let permissions = await UserPermissions.findOne({ userId }).populate('userId', 'name email role');

    // If no permissions exist, create default based on role
    if (!permissions) {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Create default permissions based on role
      const defaultPermissions = getDefaultPermissionsByRole(targetUser.role);
      permissions = await UserPermissions.create({
        userId,
        ...defaultPermissions,
        updatedBy: decoded.userId,
      });
      
      permissions = await UserPermissions.findById(permissions._id).populate('userId', 'name email role');
    }

    return NextResponse.json({ permissions }, { status: 200 });
  } catch (error: any) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to get permissions', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update permissions for a user
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin or securityadmin
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'securityadmin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      canViewCalendar,
      canCreateEvents,
      canEditEvents,
      canDeleteEvents,
      canViewApplications,
      canManageUsers,
      canAccessSecurity,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create permissions
    const permissions = await UserPermissions.findOneAndUpdate(
      { userId },
      {
        canViewCalendar,
        canCreateEvents,
        canEditEvents,
        canDeleteEvents,
        canViewApplications,
        canManageUsers,
        canAccessSecurity,
        updatedBy: decoded.userId,
      },
      { new: true, upsert: true }
    ).populate('userId', 'name email role');

    return NextResponse.json(
      { message: 'Permissions updated successfully', permissions },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get default permissions by role
function getDefaultPermissionsByRole(role: string) {
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
