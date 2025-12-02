import { NextRequest, NextResponse } from 'next/server';
import { getLogs, getLogStats, clearLogs, exportLogs, LogLevel } from '@/lib/security/activity-logger';
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
    const level = searchParams.get('level') as LogLevel | null;
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const format = searchParams.get('format') as 'json' | 'csv' | null;
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      return NextResponse.json(getLogStats());
    }

    if (format) {
      const exported = exportLogs(format);
      return new NextResponse(exported, {
        headers: {
          'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
          'Content-Disposition': `attachment; filename="security-logs.${format}"`,
        },
      });
    }

    const logs = getLogs({
      level: level || undefined,
      category: category || undefined,
      userId: userId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      logs,
      total: logs.length,
      stats: getLogStats(),
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
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

    const cleared = clearLogs();

    return NextResponse.json({
      success: true,
      message: `Cleared ${cleared} log entries`,
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
