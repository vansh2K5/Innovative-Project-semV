import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

const lokiFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const logEntry = {
    ts: new Date(timestamp as string).getTime() * 1000000,
    line: JSON.stringify({
      level,
      message,
      ...metadata,
    }),
  };
  return JSON.stringify(logEntry);
});

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${timestamp} [${level}]: ${message} ${meta}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { 
    service: 'ems-security',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      ),
    }),
  ],
});

if (process.env.LOKI_URL) {
  const lokiTransport = new winston.transports.Http({
    host: process.env.LOKI_HOST || 'localhost',
    port: parseInt(process.env.LOKI_PORT || '3100'),
    path: '/loki/api/v1/push',
    format: lokiFormat,
  });
  logger.add(lokiTransport);
}

export const securityLogger = {
  auth: {
    login: (userId: string, email: string, ip: string, success: boolean) => {
      logger.info('Authentication attempt', {
        category: 'auth',
        event: 'login',
        userId,
        email,
        ip,
        success,
      });
    },
    logout: (userId: string, ip: string) => {
      logger.info('User logout', {
        category: 'auth',
        event: 'logout',
        userId,
        ip,
      });
    },
    tokenRefresh: (userId: string, success: boolean) => {
      logger.info('Token refresh', {
        category: 'auth',
        event: 'token_refresh',
        userId,
        success,
      });
    },
    passwordChange: (userId: string, success: boolean) => {
      logger.info('Password change', {
        category: 'auth',
        event: 'password_change',
        userId,
        success,
      });
    },
  },

  access: {
    denied: (userId: string, resource: string, reason: string, ip: string) => {
      logger.warn('Access denied', {
        category: 'access',
        event: 'denied',
        userId,
        resource,
        reason,
        ip,
      });
    },
    granted: (userId: string, resource: string, ip: string) => {
      logger.info('Access granted', {
        category: 'access',
        event: 'granted',
        userId,
        resource,
        ip,
      });
    },
  },

  threat: {
    detected: (type: string, ip: string, details: Record<string, any>) => {
      logger.error('Threat detected', {
        category: 'threat',
        event: 'detected',
        type,
        ip,
        ...details,
      });
    },
    blocked: (ip: string, reason: string) => {
      logger.warn('IP blocked', {
        category: 'threat',
        event: 'ip_blocked',
        ip,
        reason,
      });
    },
    rateLimited: (ip: string, endpoint: string) => {
      logger.warn('Rate limit exceeded', {
        category: 'threat',
        event: 'rate_limited',
        ip,
        endpoint,
      });
    },
  },

  session: {
    created: (userId: string, sessionId: string, ip: string) => {
      logger.info('Session created', {
        category: 'session',
        event: 'created',
        userId,
        sessionId,
        ip,
      });
    },
    expired: (userId: string, sessionId: string) => {
      logger.info('Session expired', {
        category: 'session',
        event: 'expired',
        userId,
        sessionId,
      });
    },
    invalidated: (userId: string, sessionId: string, reason: string) => {
      logger.info('Session invalidated', {
        category: 'session',
        event: 'invalidated',
        userId,
        sessionId,
        reason,
      });
    },
  },

  admin: {
    action: (adminId: string, action: string, target: string, details: Record<string, any>) => {
      logger.info('Admin action', {
        category: 'admin',
        event: 'action',
        adminId,
        action,
        target,
        ...details,
      });
    },
    configChange: (adminId: string, setting: string, oldValue: any, newValue: any) => {
      logger.warn('Configuration changed', {
        category: 'admin',
        event: 'config_change',
        adminId,
        setting,
        oldValue,
        newValue,
      });
    },
  },

  raw: logger,
};

export default securityLogger;
