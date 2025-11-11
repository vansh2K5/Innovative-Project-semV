import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { getUserFromRequest } from '@/lib/auth';

// DELETE all events (admin only)
export async function DELETE(request: NextRequest) {
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

    // Only admins can clear all events
    if (tokenUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Delete all events
    const result = await Event.deleteMany({});

    return NextResponse.json(
      {
        message: 'All events cleared successfully',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Clear events error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to clear events',
      },
      { status: 500 }
    );
  }
}
