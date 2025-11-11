import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getUserFromRequest, verifyUserExists } from '@/lib/auth';

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify requesting user still exists
    const userExists = await verifyUserExists(tokenUser.userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User account no longer exists' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Users can view their own profile, admins and securityadmins can view any profile
    if (tokenUser.userId !== id && tokenUser.role !== 'admin' && tokenUser.role !== 'securityadmin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify requesting user still exists
    const userExists = await verifyUserExists(tokenUser.userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User account no longer exists' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Users can update their own profile, admins and securityadmins can update any profile
    if (tokenUser.userId !== id && tokenUser.role !== 'admin' && tokenUser.role !== 'securityadmin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, department, position, role, isActive } = body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;

    // Only admins can change role and isActive status
    if (tokenUser.role === 'admin') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Get user from token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Only verify requesting user exists if they're NOT deleting themselves
    // (Allow self-deletion even if account is being deleted)
    if (tokenUser.userId !== id) {
      const userExists = await verifyUserExists(tokenUser.userId);
      if (!userExists) {
        return NextResponse.json(
          { error: 'User account no longer exists' },
          { status: 401 }
        );
      }
    }

    // Check if user is admin
    if (tokenUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
