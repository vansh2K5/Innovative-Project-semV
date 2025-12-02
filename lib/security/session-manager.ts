import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  userId: string;
  userName?: string;
  userRole?: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

export function calculateUptime(session: Session): {
  totalSeconds: number;
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const start = new Date(session.createdAt);
  const totalSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  let formatted = '';
  if (hours > 0) {
    formatted += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    formatted += `${minutes}m `;
  }
  formatted += `${seconds}s`;
  
  return { totalSeconds, formatted: formatted.trim(), hours, minutes, seconds };
}

export interface SessionConfig {
  maxAge: number;
  maxConcurrentSessions: number;
  sessionTimeout: number;
  renewOnActivity: boolean;
  secureCookie: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

const defaultConfig: SessionConfig = {
  maxAge: 24 * 60 * 60 * 1000,
  maxConcurrentSessions: 5,
  sessionTimeout: 30 * 60 * 1000,
  renewOnActivity: true,
  secureCookie: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax',
};

let sessionConfig: SessionConfig = { ...defaultConfig };
const activeSessions: Map<string, Session[]> = new Map();

export function getSessionConfig(): SessionConfig {
  return sessionConfig;
}

export function updateSessionConfig(config: Partial<SessionConfig>): SessionConfig {
  sessionConfig = { ...sessionConfig, ...config };
  return sessionConfig;
}

export function createSession(
  userId: string, 
  userAgent: string, 
  ipAddress: string,
  userName?: string,
  userRole?: string
): Session {
  const now = new Date();
  const session: Session = {
    id: uuidv4(),
    userId: userId,
    userName,
    userRole,
    userAgent,
    ipAddress,
    createdAt: now,
    lastActivity: now,
    expiresAt: new Date(now.getTime() + sessionConfig.maxAge),
    isActive: true,
    metadata: {},
  };

  const userSessions = activeSessions.get(userId) || [];
  
  if (userSessions.length >= sessionConfig.maxConcurrentSessions) {
    userSessions.sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime());
    userSessions.shift();
  }
  
  userSessions.push(session);
  activeSessions.set(userId, userSessions);

  return session;
}

export function getSession(userId: string, sessionId: string): Session | null {
  const userSessions = activeSessions.get(userId);
  if (!userSessions) return null;

  const session = userSessions.find(s => s.id === sessionId);
  if (!session) return null;

  if (new Date() > session.expiresAt || !session.isActive) {
    invalidateSession(userId, sessionId);
    return null;
  }

  if (sessionConfig.renewOnActivity) {
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + sessionConfig.maxAge);
  }

  return session;
}

export function getUserSessions(userId: string): Session[] {
  const userSessions = activeSessions.get(userId) || [];
  const now = new Date();
  
  return userSessions.filter(session => {
    if (now > session.expiresAt || !session.isActive) {
      return false;
    }
    return true;
  });
}

export function getAllActiveSessions(): { userId: string; sessions: Session[] }[] {
  const result: { userId: string; sessions: Session[] }[] = [];
  
  activeSessions.forEach((sessions, oderId) => {
    const activeSess = sessions.filter(s => s.isActive && new Date() < s.expiresAt);
    if (activeSess.length > 0) {
      result.push({ userId: oderId, sessions: activeSess });
    }
  });

  return result;
}

export function invalidateSession(userId: string, sessionId: string): boolean {
  const userSessions = activeSessions.get(userId);
  if (!userSessions) return false;

  const sessionIndex = userSessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return false;

  userSessions[sessionIndex].isActive = false;
  return true;
}

export function invalidateAllUserSessions(userId: string): number {
  const userSessions = activeSessions.get(userId);
  if (!userSessions) return 0;

  const count = userSessions.length;
  userSessions.forEach(s => (s.isActive = false));
  activeSessions.delete(userId);
  return count;
}

export function getSessionStats(): {
  totalSessions: number;
  activeUsers: number;
  sessionsPerUser: Record<string, number>;
} {
  let totalSessions = 0;
  const sessionsPerUser: Record<string, number> = {};

  activeSessions.forEach((sessions, oderId) => {
    const activeSess = sessions.filter(s => s.isActive && new Date() < s.expiresAt);
    if (activeSess.length > 0) {
      sessionsPerUser[oderId] = activeSess.length;
      totalSessions += activeSess.length;
    }
  });

  return {
    totalSessions,
    activeUsers: Object.keys(sessionsPerUser).length,
    sessionsPerUser,
  };
}

export function cleanupExpiredSessions(): number {
  let cleaned = 0;
  const now = new Date();

  activeSessions.forEach((sessions, oderId) => {
    const validSessions = sessions.filter(s => {
      if (now > s.expiresAt || !s.isActive) {
        cleaned++;
        return false;
      }
      return true;
    });

    if (validSessions.length === 0) {
      activeSessions.delete(oderId);
    } else {
      activeSessions.set(oderId, validSessions);
    }
  });

  return cleaned;
}

setInterval(() => {
  cleanupExpiredSessions();
}, 5 * 60 * 1000);

export default {
  getConfig: getSessionConfig,
  updateConfig: updateSessionConfig,
  create: createSession,
  get: getSession,
  getUserSessions,
  getAllActive: getAllActiveSessions,
  invalidate: invalidateSession,
  invalidateAll: invalidateAllUserSessions,
  getStats: getSessionStats,
  cleanup: cleanupExpiredSessions,
};
