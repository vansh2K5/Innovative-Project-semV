import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Analytics from '@/lib/models/Analytics';
import { generateToken } from '@/lib/auth';
import { securityLogger } from '@/lib/security/winston-logger';
import { createSession } from '@/lib/security/session-manager';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      securityLogger.auth.login('unknown', email.toLowerCase(), ip, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      securityLogger.auth.login(user._id.toString(), email.toLowerCase(), ip, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log analytics activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { userId: user._id, date: today },
      {
        $push: {
          activities: {
            type: 'login',
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create security session
    const session = createSession(user._id.toString(), userAgent, ip);
    securityLogger.auth.login(user._id.toString(), user.email, ip, true);
    securityLogger.session.created(user._id.toString(), session.id, ip);

    // Create response with user data (excluding password)
    const userData = {
      userId: user._id.toString(), // Add userId for consistency
      _id: user._id.toString(), // Keep _id for backward compatibility
      id: user._id, // Keep id for backward compatibility
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      position: user.position,
      joinedDate: user.joinedDate,
      lastLogin: user.lastLogin,
    };

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
        token,
      },
      { status: 200 }
    );

    // Set token in cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
