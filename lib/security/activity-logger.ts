export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  action: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, any>;
  duration?: number;
  status?: 'success' | 'failure' | 'pending';
}

export interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  maxEntries: number;
  retentionDays: number;
  lokiEndpoint?: string;
  lokiLabels?: Record<string, string>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

const defaultConfig: LoggerConfig = {
  enabled: true,
  minLevel: 'info',
  maxEntries: 10000,
  retentionDays: 30,
};

let loggerConfig: LoggerConfig = { ...defaultConfig };
const logStore: LogEntry[] = [];

export function getLoggerConfig(): LoggerConfig {
  return loggerConfig;
}

export function updateLoggerConfig(config: Partial<LoggerConfig>): LoggerConfig {
  loggerConfig = { ...loggerConfig, ...config };
  return loggerConfig;
}

export function log(entry: Omit<LogEntry, 'timestamp'>): LogEntry {
  if (!loggerConfig.enabled) return { ...entry, timestamp: new Date() };

  if (LOG_LEVELS[entry.level] < LOG_LEVELS[loggerConfig.minLevel]) {
    return { ...entry, timestamp: new Date() };
  }

  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  logStore.push(logEntry);

  if (logStore.length > loggerConfig.maxEntries) {
    logStore.shift();
  }

  if (loggerConfig.lokiEndpoint) {
    sendToLoki(logEntry).catch(console.error);
  }

  return logEntry;
}

export function logActivity(
  category: string,
  action: string,
  options: {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    details?: Record<string, any>;
    level?: LogLevel;
    status?: 'success' | 'failure' | 'pending';
  } = {}
): LogEntry {
  return log({
    level: options.level || 'info',
    category,
    action,
    ...options,
  });
}

export function logSecurityEvent(
  action: string,
  details: Record<string, any>,
  level: LogLevel = 'warn'
): LogEntry {
  return log({
    level,
    category: 'security',
    action,
    details,
    status: 'pending',
  });
}

export function logAuthEvent(
  action: 'login' | 'logout' | 'register' | 'password_change' | 'token_refresh',
  userId: string,
  success: boolean,
  details?: Record<string, any>
): LogEntry {
  return log({
    level: success ? 'info' : 'warn',
    category: 'authentication',
    action,
    userId,
    details,
    status: success ? 'success' : 'failure',
  });
}

export function logAccessEvent(
  userId: string,
  resource: string,
  action: string,
  allowed: boolean,
  details?: Record<string, any>
): LogEntry {
  return log({
    level: allowed ? 'info' : 'warn',
    category: 'access_control',
    action,
    userId,
    resource,
    details,
    status: allowed ? 'success' : 'failure',
  });
}

export function getLogs(filter?: {
  level?: LogLevel;
  category?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): LogEntry[] {
  let filtered = [...logStore];

  if (filter) {
    if (filter.level) {
      const minLevel = LOG_LEVELS[filter.level];
      filtered = filtered.filter(e => LOG_LEVELS[e.level] >= minLevel);
    }
    if (filter.category) {
      filtered = filtered.filter(e => e.category === filter.category);
    }
    if (filter.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }
    if (filter.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }
  }

  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

export function getLogStats(): {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<string, number>;
  recentErrors: LogEntry[];
} {
  const byLevel: Record<LogLevel, number> = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    critical: 0,
  };
  const byCategory: Record<string, number> = {};

  logStore.forEach(entry => {
    byLevel[entry.level]++;
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
  });

  const recentErrors = logStore
    .filter(e => e.level === 'error' || e.level === 'critical')
    .slice(-10)
    .reverse();

  return {
    totalLogs: logStore.length,
    byLevel,
    byCategory,
    recentErrors,
  };
}

async function sendToLoki(entry: LogEntry): Promise<void> {
  if (!loggerConfig.lokiEndpoint) return;

  const lokiPayload = {
    streams: [
      {
        stream: {
          app: 'ems',
          level: entry.level,
          category: entry.category,
          ...loggerConfig.lokiLabels,
        },
        values: [
          [
            (entry.timestamp.getTime() * 1000000).toString(),
            JSON.stringify({
              action: entry.action,
              userId: entry.userId,
              sessionId: entry.sessionId,
              ipAddress: entry.ipAddress,
              resource: entry.resource,
              details: entry.details,
              status: entry.status,
            }),
          ],
        ],
      },
    ],
  };

  try {
    await fetch(`${loggerConfig.lokiEndpoint}/loki/api/v1/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lokiPayload),
    });
  } catch (error) {
    console.error('Failed to send log to Loki:', error);
  }
}

export function clearLogs(): number {
  const count = logStore.length;
  logStore.length = 0;
  return count;
}

export function exportLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
    const headers = ['timestamp', 'level', 'category', 'action', 'userId', 'status', 'details'];
    const rows = logStore.map(e => [
      e.timestamp.toISOString(),
      e.level,
      e.category,
      e.action,
      e.userId || '',
      e.status || '',
      JSON.stringify(e.details || {}),
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  return JSON.stringify(logStore, null, 2);
}

export default {
  getConfig: getLoggerConfig,
  updateConfig: updateLoggerConfig,
  log,
  logActivity,
  logSecurityEvent,
  logAuthEvent,
  logAccessEvent,
  getLogs,
  getStats: getLogStats,
  clear: clearLogs,
  export: exportLogs,
};
