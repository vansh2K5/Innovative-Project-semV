import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { getUserFromRequest } from '@/lib/auth';

// DELETE user's own events
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

    // Delete only events created by this user
    const result = await Event.deleteMany({ createdBy: tokenUser.userId });

    return NextResponse.json(
      {
        message: 'Your events cleared successfully',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Clear my events error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Failed to clear your events',
      },
      { status: 500 }
    );
  }
}
