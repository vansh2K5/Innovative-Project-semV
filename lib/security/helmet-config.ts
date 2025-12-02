import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

const defaultSecurityHeaders: SecurityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export interface HelmetConfig {
  enabled: boolean;
  headers: SecurityHeaders;
  contentSecurityPolicy: {
    enabled: boolean;
    reportOnly: boolean;
    directives: Record<string, string[]>;
  };
  xssProtection: boolean;
  noSniff: boolean;
  frameguard: 'DENY' | 'SAMEORIGIN' | false;
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
}

const defaultConfig: HelmetConfig = {
  enabled: true,
  headers: defaultSecurityHeaders,
  contentSecurityPolicy: {
    enabled: true,
    reportOnly: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'ws:', 'wss:'],
    },
  },
  xssProtection: true,
  noSniff: true,
  frameguard: 'SAMEORIGIN',
  hsts: {
    enabled: true,
    maxAge: 31536000,
    includeSubDomains: true,
    preload: false,
  },
};

let currentConfig: HelmetConfig = { ...defaultConfig };

export function getHelmetConfig(): HelmetConfig {
  return currentConfig;
}

export function updateHelmetConfig(config: Partial<HelmetConfig>): HelmetConfig {
  currentConfig = { ...currentConfig, ...config };
  return currentConfig;
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  if (!currentConfig.enabled) return response;

  const headers = response.headers;

  if (currentConfig.noSniff) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }

  if (currentConfig.xssProtection) {
    headers.set('X-XSS-Protection', '1; mode=block');
  }

  if (currentConfig.frameguard) {
    headers.set('X-Frame-Options', currentConfig.frameguard);
  }

  if (currentConfig.hsts.enabled) {
    let hstsValue = `max-age=${currentConfig.hsts.maxAge}`;
    if (currentConfig.hsts.includeSubDomains) hstsValue += '; includeSubDomains';
    if (currentConfig.hsts.preload) hstsValue += '; preload';
    headers.set('Strict-Transport-Security', hstsValue);
  }

  if (currentConfig.contentSecurityPolicy.enabled) {
    const csp = Object.entries(currentConfig.contentSecurityPolicy.directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
    const headerName = currentConfig.contentSecurityPolicy.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    headers.set(headerName, csp);
  }

  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export function securityMiddleware(request: NextRequest): NextResponse | null {
  return null;
}

export default {
  getConfig: getHelmetConfig,
  updateConfig: updateHelmetConfig,
  applyHeaders: applySecurityHeaders,
};
