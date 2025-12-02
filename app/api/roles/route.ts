import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Role, { DEFAULT_ROLES } from '@/lib/models/Role';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const roles = await Role.find({ isActive: true }).sort({ isSystemRole: -1, name: 1 });

    if (roles.length === 0) {
      for (const defaultRole of DEFAULT_ROLES) {
        await Role.findOneAndUpdate(
          { name: defaultRole.name },
          defaultRole,
          { upsert: true, new: true }
        );
      }
      const initialRoles = await Role.find({ isActive: true }).sort({ isSystemRole: -1, name: 1 });
      return NextResponse.json({ roles: initialRoles });
    }

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'securityadmin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { name, displayName, description, permissions } = body;

    if (!name || !displayName) {
      return NextResponse.json({ error: 'Name and display name are required' }, { status: 400 });
    }

    const normalizedName = name.toLowerCase().replace(/\s+/g, '');

    const existingRole = await Role.findOne({ name: normalizedName });
    if (existingRole) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 });
    }

    const defaultPermissions = {
      canViewCalendar: true,
      canCreateEvents: false,
      canEditEvents: false,
      canDeleteEvents: false,
      canViewApplications: true,
      canManageUsers: false,
      canAccessSecurity: false,
      canViewReports: false,
      canExportData: false,
    };

    const newRole = new Role({
      name: normalizedName,
      displayName,
      description: description || '',
      permissions: { ...defaultPermissions, ...permissions },
      isSystemRole: false,
      isActive: true,
      createdBy: decoded.userId,
    });

    await newRole.save();

    return NextResponse.json({ 
      message: 'Role created successfully',
      role: newRole 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'securityadmin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { roleId, displayName, description, permissions } = body;

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.isSystemRole) {
      return NextResponse.json({ error: 'System roles cannot be modified' }, { status: 403 });
    }

    if (displayName) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = { ...role.permissions, ...permissions };

    await role.save();

    return NextResponse.json({ 
      message: 'Role updated successfully',
      role 
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.isSystemRole) {
      return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 403 });
    }

    role.isActive = false;
    await role.save();

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
