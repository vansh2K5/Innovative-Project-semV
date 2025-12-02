import { logSecurityEvent } from './activity-logger';

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type ThreatType = 
  | 'brute_force'
  | 'suspicious_login'
  | 'unauthorized_access'
  | 'rate_limit_exceeded'
  | 'sql_injection'
  | 'xss_attempt'
  | 'session_hijacking'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'anomalous_behavior';

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  level: ThreatLevel;
  timestamp: Date;
  source: {
    ip?: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
  };
  target?: {
    resource?: string;
    userId?: string;
    endpoint?: string;
  };
  details: Record<string, any>;
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive';
  mitigationAction?: string;
}

export interface ThreatDetectorConfig {
  enabled: boolean;
  maxFailedLogins: number;
  failedLoginWindow: number;
  rateLimitRequests: number;
  rateLimitWindow: number;
  suspiciousPatterns: string[];
  blockedIPs: string[];
  wazuhEndpoint?: string;
  alertThreshold: ThreatLevel;
}

const defaultConfig: ThreatDetectorConfig = {
  enabled: true,
  maxFailedLogins: 5,
  failedLoginWindow: 15 * 60 * 1000,
  rateLimitRequests: 100,
  rateLimitWindow: 60 * 1000,
  suspiciousPatterns: [
    'SELECT.*FROM',
    'UNION.*SELECT',
    'DROP.*TABLE',
    '<script>',
    'javascript:',
    'onerror=',
    'onload=',
    '../',
    '..\\',
  ],
  blockedIPs: [],
  alertThreshold: 'medium',
};

let threatConfig: ThreatDetectorConfig = { ...defaultConfig };
const threatStore: ThreatEvent[] = [];
const failedLoginAttempts: Map<string, { count: number; firstAttempt: Date }> = new Map();
const requestCounts: Map<string, { count: number; windowStart: Date }> = new Map();

export function getThreatConfig(): ThreatDetectorConfig {
  return threatConfig;
}

export function updateThreatConfig(config: Partial<ThreatDetectorConfig>): ThreatDetectorConfig {
  threatConfig = { ...threatConfig, ...config };
  return threatConfig;
}

function generateThreatId(): string {
  return `THR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function detectThreat(event: Omit<ThreatEvent, 'id' | 'timestamp' | 'status'>): ThreatEvent {
  const threat: ThreatEvent = {
    id: generateThreatId(),
    timestamp: new Date(),
    status: 'detected',
    ...event,
  };

  threatStore.push(threat);

  logSecurityEvent(
    `threat_detected_${event.type}`,
    {
      threatId: threat.id,
      level: threat.level,
      source: threat.source,
      target: threat.target,
      details: threat.details,
    },
    threat.level === 'critical' ? 'critical' : threat.level === 'high' ? 'error' : 'warn'
  );

  if (threatConfig.wazuhEndpoint) {
    sendToWazuh(threat).catch(console.error);
  }

  return threat;
}

export function checkBruteForce(identifier: string, success: boolean): ThreatEvent | null {
  if (!threatConfig.enabled) return null;

  if (success) {
    failedLoginAttempts.delete(identifier);
    return null;
  }

  const now = new Date();
  const existing = failedLoginAttempts.get(identifier);

  if (existing) {
    const elapsed = now.getTime() - existing.firstAttempt.getTime();
    
    if (elapsed > threatConfig.failedLoginWindow) {
      failedLoginAttempts.set(identifier, { count: 1, firstAttempt: now });
      return null;
    }

    existing.count++;

    if (existing.count >= threatConfig.maxFailedLogins) {
      failedLoginAttempts.delete(identifier);
      
      return detectThreat({
        type: 'brute_force',
        level: 'high',
        source: { ip: identifier },
        details: {
          attempts: existing.count,
          windowMs: threatConfig.failedLoginWindow,
          message: `${existing.count} failed login attempts within ${threatConfig.failedLoginWindow / 60000} minutes`,
        },
      });
    }
  } else {
    failedLoginAttempts.set(identifier, { count: 1, firstAttempt: now });
  }

  return null;
}

export function checkRateLimit(identifier: string): ThreatEvent | null {
  if (!threatConfig.enabled) return null;

  const now = new Date();
  const existing = requestCounts.get(identifier);

  if (existing) {
    const elapsed = now.getTime() - existing.windowStart.getTime();

    if (elapsed > threatConfig.rateLimitWindow) {
      requestCounts.set(identifier, { count: 1, windowStart: now });
      return null;
    }

    existing.count++;

    if (existing.count > threatConfig.rateLimitRequests) {
      return detectThreat({
        type: 'rate_limit_exceeded',
        level: 'medium',
        source: { ip: identifier },
        details: {
          requests: existing.count,
          windowMs: threatConfig.rateLimitWindow,
          message: `Rate limit exceeded: ${existing.count} requests within ${threatConfig.rateLimitWindow / 1000} seconds`,
        },
      });
    }
  } else {
    requestCounts.set(identifier, { count: 1, windowStart: now });
  }

  return null;
}

export function checkSuspiciousInput(input: string, context?: { userId?: string; ip?: string; endpoint?: string }): ThreatEvent | null {
  if (!threatConfig.enabled || !input) return null;

  for (const pattern of threatConfig.suspiciousPatterns) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(input)) {
      const isSqlInjection = pattern.includes('SELECT') || pattern.includes('DROP') || pattern.includes('UNION');
      const isXss = pattern.includes('script') || pattern.includes('javascript') || pattern.includes('onerror');

      return detectThreat({
        type: isSqlInjection ? 'sql_injection' : isXss ? 'xss_attempt' : 'anomalous_behavior',
        level: 'high',
        source: { ip: context?.ip, userId: context?.userId },
        target: { endpoint: context?.endpoint },
        details: {
          matchedPattern: pattern,
          inputSnippet: input.substring(0, 100),
          message: `Suspicious input detected matching pattern: ${pattern}`,
        },
      });
    }
  }

  return null;
}

export function checkUnauthorizedAccess(
  userId: string,
  resource: string,
  requiredRole: string,
  actualRole: string
): ThreatEvent | null {
  if (!threatConfig.enabled) return null;

  if (requiredRole !== actualRole && requiredRole === 'admin' && actualRole !== 'admin') {
    return detectThreat({
      type: 'unauthorized_access',
      level: 'medium',
      source: { userId },
      target: { resource },
      details: {
        requiredRole,
        actualRole,
        message: `User attempted to access ${resource} without required ${requiredRole} role`,
      },
    });
  }

  return null;
}

export function isIPBlocked(ip: string): boolean {
  return threatConfig.blockedIPs.includes(ip);
}

export function blockIP(ip: string, reason?: string): void {
  if (!threatConfig.blockedIPs.includes(ip)) {
    threatConfig.blockedIPs.push(ip);
    logSecurityEvent('ip_blocked', { ip, reason }, 'warn');
  }
}

export function unblockIP(ip: string): boolean {
  const index = threatConfig.blockedIPs.indexOf(ip);
  if (index > -1) {
    threatConfig.blockedIPs.splice(index, 1);
    logSecurityEvent('ip_unblocked', { ip }, 'info');
    return true;
  }
  return false;
}

export function getThreats(filter?: {
  type?: ThreatType;
  level?: ThreatLevel;
  status?: ThreatEvent['status'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): ThreatEvent[] {
  let filtered = [...threatStore];

  if (filter) {
    if (filter.type) filtered = filtered.filter(t => t.type === filter.type);
    if (filter.level) filtered = filtered.filter(t => t.level === filter.level);
    if (filter.status) filtered = filtered.filter(t => t.status === filter.status);
    if (filter.startDate) filtered = filtered.filter(t => t.timestamp >= filter.startDate!);
    if (filter.endDate) filtered = filtered.filter(t => t.timestamp <= filter.endDate!);
  }

  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

export function updateThreatStatus(
  threatId: string,
  status: ThreatEvent['status'],
  mitigationAction?: string
): ThreatEvent | null {
  const threat = threatStore.find(t => t.id === threatId);
  if (threat) {
    threat.status = status;
    if (mitigationAction) threat.mitigationAction = mitigationAction;
    logSecurityEvent('threat_status_updated', { threatId, status, mitigationAction }, 'info');
    return threat;
  }
  return null;
}

export function getThreatStats(): {
  totalThreats: number;
  byType: Record<ThreatType, number>;
  byLevel: Record<ThreatLevel, number>;
  byStatus: Record<ThreatEvent['status'], number>;
  recentThreats: ThreatEvent[];
} {
  const byType: Record<ThreatType, number> = {} as any;
  const byLevel: Record<ThreatLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const byStatus: Record<ThreatEvent['status'], number> = {
    detected: 0,
    investigating: 0,
    mitigated: 0,
    resolved: 0,
    false_positive: 0,
  };

  threatStore.forEach(threat => {
    byType[threat.type] = (byType[threat.type] || 0) + 1;
    byLevel[threat.level]++;
    byStatus[threat.status]++;
  });

  const recentThreats = threatStore.slice(-10).reverse();

  return {
    totalThreats: threatStore.length,
    byType,
    byLevel,
    byStatus,
    recentThreats,
  };
}

async function sendToWazuh(threat: ThreatEvent): Promise<void> {
  if (!threatConfig.wazuhEndpoint) return;

  const wazuhEvent = {
    timestamp: threat.timestamp.toISOString(),
    rule: {
      level: threat.level === 'critical' ? 15 : threat.level === 'high' ? 12 : threat.level === 'medium' ? 7 : 3,
      description: `EMS Security Alert: ${threat.type}`,
      id: threat.id,
    },
    agent: {
      name: 'ems-app',
      id: '001',
    },
    data: {
      srcip: threat.source.ip,
      srcuser: threat.source.userId,
      dstuser: threat.target?.userId,
      url: threat.target?.endpoint,
      ...threat.details,
    },
  };

  try {
    await fetch(`${threatConfig.wazuhEndpoint}/api/security/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wazuhEvent),
    });
  } catch (error) {
    console.error('Failed to send event to Wazuh:', error);
  }
}

export default {
  getConfig: getThreatConfig,
  updateConfig: updateThreatConfig,
  detect: detectThreat,
  checkBruteForce,
  checkRateLimit,
  checkSuspiciousInput,
  checkUnauthorizedAccess,
  isIPBlocked,
  blockIP,
  unblockIP,
  getThreats,
  updateStatus: updateThreatStatus,
  getStats: getThreatStats,
};
