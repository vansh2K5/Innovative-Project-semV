import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllActiveSessions, 
  getSessionStats, 
  invalidateSession,
  invalidateAllUserSessions,
  cleanupExpiredSessions,
  getSessionConfig,
  getSession
} from '@/lib/security/session-manager';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      return NextResponse.json(getSessionStats());
    }

    const sessions = getAllActiveSessions();
    const stats = getSessionStats();
    const config = getSessionConfig();

    return NextResponse.json({
      sessions,
      stats,
      config: {
        maxAge: config.maxAge,
        maxConcurrentSessions: config.maxConcurrentSessions,
        sessionTimeout: config.sessionTimeout,
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
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

    const body = await request.json();
    const { action, userId, sessionId } = body;

    switch (action) {
      case 'invalidate':
        if (!userId || !sessionId) {
          return NextResponse.json({ error: 'userId and sessionId required' }, { status: 400 });
        }
        const invalidated = invalidateSession(userId, sessionId);
        if (!invalidated) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
        // Log the session invalidation
        const { securityLogger } = await import('@/lib/security/winston-logger');
        securityLogger.session.invalidated(userId, sessionId, 'Admin invalidation');
        
        return NextResponse.json({ success: true, message: 'Session invalidated', userId, sessionId });

      case 'invalidateAll':
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        const count = invalidateAllUserSessions(userId);
        
        // Log the sessions invalidation
        const { securityLogger: logger } = await import('@/lib/security/winston-logger');
        logger.admin.action(decoded.userId, 'invalidate_all_sessions', userId, { sessionsInvalidated: count });
        
        return NextResponse.json({ success: true, message: `${count} sessions invalidated`, userId, count });

      case 'cleanup':
        const cleaned = cleanupExpiredSessions();
        return NextResponse.json({ success: true, message: `${cleaned} expired sessions cleaned up` });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
