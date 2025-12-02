import { NextRequest, NextResponse } from 'next/server';
import { 
  getThreats, 
  getThreatStats, 
  updateThreatStatus,
  blockIP,
  unblockIP,
  getThreatConfig,
  ThreatLevel,
  ThreatType
} from '@/lib/security/threat-detector';
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
    const type = searchParams.get('type') as ThreatType | null;
    const level = searchParams.get('level') as ThreatLevel | null;
    const status = searchParams.get('status') as any;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      return NextResponse.json(getThreatStats());
    }

    const threats = getThreats({
      type: type || undefined,
      level: level || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({
      threats,
      total: threats.length,
      stats: getThreatStats(),
      config: {
        blockedIPs: getThreatConfig().blockedIPs,
      },
    });
  } catch (error) {
    console.error('Error fetching threats:', error);
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, threatId, status, mitigationAction, ip } = body;

    switch (action) {
      case 'updateStatus':
        if (!threatId || !status) {
          return NextResponse.json({ error: 'threatId and status required' }, { status: 400 });
        }
        const updatedThreat = updateThreatStatus(threatId, status, mitigationAction);
        if (!updatedThreat) {
          return NextResponse.json({ error: 'Threat not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, threat: updatedThreat });

      case 'blockIP':
        if (!ip) {
          return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }
        blockIP(ip, body.reason);
        return NextResponse.json({ success: true, message: `IP ${ip} blocked` });

      case 'unblockIP':
        if (!ip) {
          return NextResponse.json({ error: 'IP address required' }, { status: 400 });
        }
        const unblocked = unblockIP(ip);
        if (!unblocked) {
          return NextResponse.json({ error: 'IP not in blocklist' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: `IP ${ip} unblocked` });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating threat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
