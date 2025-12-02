import { NextRequest, NextResponse } from 'next/server';
import { getHelmetConfig, updateHelmetConfig } from '@/lib/security/helmet-config';
import { getSessionConfig, updateSessionConfig } from '@/lib/security/session-manager';
import { getLoggerConfig, updateLoggerConfig } from '@/lib/security/activity-logger';
import { getThreatConfig, updateThreatConfig } from '@/lib/security/threat-detector';
import { getKeycloakConfig, updateKeycloakConfig } from '@/lib/security/keycloak-auth';
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

    return NextResponse.json({
      helmet: getHelmetConfig(),
      sessions: getSessionConfig(),
      logger: getLoggerConfig(),
      threats: getThreatConfig(),
      keycloak: {
        ...getKeycloakConfig(),
        clientSecret: getKeycloakConfig().clientSecret ? '********' : undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
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
    const { module, config } = body;

    let updatedConfig;

    switch (module) {
      case 'helmet':
        updatedConfig = updateHelmetConfig(config);
        break;
      case 'sessions':
        updatedConfig = updateSessionConfig(config);
        break;
      case 'logger':
        updatedConfig = updateLoggerConfig(config);
        break;
      case 'threats':
        updatedConfig = updateThreatConfig(config);
        break;
      case 'keycloak':
        updatedConfig = updateKeycloakConfig(config);
        break;
      default:
        return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      module,
      config: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
