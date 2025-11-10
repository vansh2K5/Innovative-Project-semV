import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analytics from '@/lib/models/Analytics';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user from token
    const user = getUserFromRequest(request);

    if (user) {
      // Log analytics activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await Analytics.findOneAndUpdate(
        { userId: user.userId, date: today },
        {
          $push: {
            activities: {
              type: 'logout',
              timestamp: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Clear token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
