import { NextRequest, NextResponse } from 'next/server';
import { 
  getKeycloakConfig, 
  updateKeycloakConfig, 
  isKeycloakEnabled,
  getKeycloakStatus,
  getAuthorizationUrl
} from '@/lib/security/keycloak-auth';
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

    const config = getKeycloakConfig();
    const status = getKeycloakStatus();

    return NextResponse.json({
      keycloak: {
        ...config,
        clientSecret: config.clientSecret ? '********' : undefined,
      },
      status,
      authUrl: isKeycloakEnabled() ? getAuthorizationUrl() : null,
      features: {
        ssoEnabled: isKeycloakEnabled(),
        mfaSupported: true,
        passwordPolicies: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAge: 90,
        },
        sessionSettings: {
          idleTimeout: 30,
          absoluteTimeout: 480,
          concurrentSessions: 5,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching auth config:', error);
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
    const { keycloak, passwordPolicies, sessionSettings } = body;

    if (keycloak) {
      updateKeycloakConfig(keycloak);
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication configuration updated',
      keycloak: {
        ...getKeycloakConfig(),
        clientSecret: getKeycloakConfig().clientSecret ? '********' : undefined,
      },
      status: getKeycloakStatus(),
    });
  } catch (error) {
    console.error('Error updating auth config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
