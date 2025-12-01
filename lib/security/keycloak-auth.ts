import { logAuthEvent } from './activity-logger';

export interface KeycloakConfig {
  enabled: boolean;
  serverUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  publicClient: boolean;
  bearerOnly: boolean;
  sslRequired: 'all' | 'external' | 'none';
  confidentialPort: number;
  redirectUri?: string;
  logoutRedirectUri?: string;
}

export interface KeycloakToken {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  refreshExpiresIn?: number;
  tokenType: string;
  sessionState?: string;
  scope: string;
}

export interface KeycloakUser {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
}

const defaultConfig: KeycloakConfig = {
  enabled: false,
  serverUrl: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'ems',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'ems-app',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  publicClient: true,
  bearerOnly: false,
  sslRequired: 'external',
  confidentialPort: 0,
};

let keycloakConfig: KeycloakConfig = { ...defaultConfig };

export function getKeycloakConfig(): KeycloakConfig {
  return keycloakConfig;
}

export function updateKeycloakConfig(config: Partial<KeycloakConfig>): KeycloakConfig {
  keycloakConfig = { ...keycloakConfig, ...config };
  return keycloakConfig;
}

export function isKeycloakEnabled(): boolean {
  return keycloakConfig.enabled && !!keycloakConfig.serverUrl && !!keycloakConfig.realm;
}

export function getAuthorizationUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    redirect_uri: keycloakConfig.redirectUri || `${process.env.APP_URL || ''}/api/auth/keycloak/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: state || generateState(),
  });

  return `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?${params}`;
}

export function getLogoutUrl(idToken?: string): string {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    post_logout_redirect_uri: keycloakConfig.logoutRedirectUri || `${process.env.APP_URL || ''}/login`,
  });

  if (idToken) {
    params.append('id_token_hint', idToken);
  }

  return `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<KeycloakToken | null> {
  if (!isKeycloakEnabled()) return null;

  try {
    const tokenUrl = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: keycloakConfig.clientId,
      code,
      redirect_uri: keycloakConfig.redirectUri || `${process.env.APP_URL || ''}/api/auth/keycloak/callback`,
    });

    if (keycloakConfig.clientSecret) {
      body.append('client_secret', keycloakConfig.clientSecret);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Keycloak token exchange failed:', error);
      logAuthEvent('login', 'unknown', false, { error, method: 'keycloak' });
      return null;
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      tokenType: data.token_type,
      sessionState: data.session_state,
      scope: data.scope,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<KeycloakToken | null> {
  if (!isKeycloakEnabled()) return null;

  try {
    const tokenUrl = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: keycloakConfig.clientId,
      refresh_token: refreshToken,
    });

    if (keycloakConfig.clientSecret) {
      body.append('client_secret', keycloakConfig.clientSecret);
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    logAuthEvent('token_refresh', 'unknown', true, { method: 'keycloak' });

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      tokenType: data.token_type,
      sessionState: data.session_state,
      scope: data.scope,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export async function validateToken(accessToken: string): Promise<KeycloakUser | null> {
  if (!isKeycloakEnabled()) return null;

  try {
    const userInfoUrl = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/userinfo`;

    const response = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}

export async function introspectToken(token: string): Promise<{ active: boolean; [key: string]: any } | null> {
  if (!isKeycloakEnabled() || !keycloakConfig.clientSecret) return null;

  try {
    const introspectUrl = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token/introspect`;

    const body = new URLSearchParams({
      token,
      client_id: keycloakConfig.clientId,
      client_secret: keycloakConfig.clientSecret,
    });

    const response = await fetch(introspectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error introspecting token:', error);
    return null;
  }
}

export function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function hasRole(user: KeycloakUser, role: string, clientId?: string): boolean {
  if (clientId && user.resource_access?.[clientId]) {
    return user.resource_access[clientId].roles.includes(role);
  }
  return user.realm_access?.roles.includes(role) || false;
}

export function hasAnyRole(user: KeycloakUser, roles: string[], clientId?: string): boolean {
  return roles.some(role => hasRole(user, role, clientId));
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getKeycloakStatus(): {
  enabled: boolean;
  configured: boolean;
  serverUrl: string | null;
  realm: string | null;
} {
  return {
    enabled: keycloakConfig.enabled,
    configured: !!(keycloakConfig.serverUrl && keycloakConfig.realm && keycloakConfig.clientId),
    serverUrl: keycloakConfig.enabled ? keycloakConfig.serverUrl : null,
    realm: keycloakConfig.enabled ? keycloakConfig.realm : null,
  };
}

export default {
  getConfig: getKeycloakConfig,
  updateConfig: updateKeycloakConfig,
  isEnabled: isKeycloakEnabled,
  getAuthUrl: getAuthorizationUrl,
  getLogoutUrl,
  exchangeCode: exchangeCodeForTokens,
  refreshToken: refreshAccessToken,
  validateToken,
  introspectToken,
  decodeJwt,
  hasRole,
  hasAnyRole,
  getStatus: getKeycloakStatus,
};
