import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analytics from '@/lib/models/Analytics';
import { getUserFromRequest } from '@/lib/auth';
import { securityLogger } from '@/lib/security/winston-logger';
import { invalidateAllUserSessions } from '@/lib/security/session-manager';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    await connectDB();

    // Get user from token
    const user = getUserFromRequest(request);

    if (user) {
      invalidateAllUserSessions(user.userId);
      securityLogger.auth.logout(user.userId, ip);
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
