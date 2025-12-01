import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const helmetHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-site',
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const blockedIPs = new Set<string>();
const MAX_REQUESTS = 100;
const WINDOW_MS = 60000;

const suspiciousPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
  /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))/i,
  /(\%3C)((\%73)|s)((\%63)|c)((\%72)|r)((\%69)|i)((\%70)|p)((\%74)|t)/i,
  /select.*from|insert.*into|delete.*from|drop.*table|update.*set/i,
  /union.*select|concat.*\(|load_file\(|into.*outfile/i,
];

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

function checkRateLimit(ip: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { limited: false, remaining: MAX_REQUESTS - 1 };
  }

  record.count++;
  if (record.count > MAX_REQUESTS) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: MAX_REQUESTS - record.count };
}

function detectThreat(request: NextRequest): { isThreat: boolean; type: string } {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return { isThreat: true, type: 'SQL_INJECTION_OR_XSS' };
    }
  }

  const dangerousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'nuclei'];
  if (dangerousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return { isThreat: true, type: 'MALICIOUS_SCANNER' };
  }

  return { isThreat: false, type: '' };
}

export function middleware(request: NextRequest) {
  const ip = getClientIP(request);
  
  if (blockedIPs.has(ip)) {
    return new NextResponse('Access Denied', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const { limited, remaining } = checkRateLimit(ip);
  if (limited) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '60',
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  const threat = detectThreat(request);
  if (threat.isThreat) {
    console.warn(`[SECURITY] Threat detected: ${threat.type} from IP: ${ip}`);
  }

  const response = NextResponse.next();

  for (const [header, value] of Object.entries(helmetHeaders)) {
    response.headers.set(header, value);
  }

  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
