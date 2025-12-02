import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { getUserFromRequest, verifyUserExists } from '@/lib/auth';

export async function PUT(request: NextRequest) {
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

    // Verify user still exists in database
    const userExists = await verifyUserExists(tokenUser.userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'User account no longer exists' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // Find user
    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'updateProfile') {
      const { name, department, position } = body;

      // Validate input
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name is required' },
          { status: 400 }
        );
      }

      // Update user
      user.name = name.trim();
      if (department !== undefined) user.department = department.trim();
      if (position !== undefined) user.position = position.trim();

      await user.save();

      return NextResponse.json(
        {
          message: 'Profile updated successfully',
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            department: user.department,
            position: user.position,
            role: user.role,
          },
        },
        { status: 200 }
      );
    }

    if (action === 'changePassword') {
      const { currentPassword, newPassword } = body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return NextResponse.json(
        { message: 'Password changed successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
