'use client';

import React, { useState, useEffect } from 'react';
import { UsersIcon, X, Trash2, RefreshCw, Clock, Timer } from 'lucide-react';

interface SessionWithUptime {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActivity: string;
  userName?: string;
  userRole?: string;
  uptime?: {
    formatted: string;
    totalSeconds: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface UserSession {
  userId: string;
  userName?: string;
  userRole?: string;
  sessions: SessionWithUptime[];
  totalUptime?: {
    formatted: string;
    totalSeconds: number;
  };
}

interface SessionStats {
  totalSessions: number;
  activeUsers: number;
  sessionsPerUser: Record<string, number>;
}

export default function SessionsDashboard({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const calculateUptime = (createdAt: string): SessionWithUptime['uptime'] => {
    const now = new Date();
    const start = new Date(createdAt);
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
  };

  const calculateTotalUptime = (sessions: SessionWithUptime[]): { formatted: string; totalSeconds: number } => {
    let totalSeconds = 0;
    sessions.forEach(session => {
      if (session.uptime) {
        totalSeconds += session.uptime.totalSeconds;
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0) formatted += `${minutes}m `;
    formatted += `${secs}s`;

    return { formatted: formatted.trim(), totalSeconds };
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/security/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        
        const sessionsWithUptime: UserSession[] = (data.sessions || []).map((userSession: UserSession) => {
          const sessionsWithCalc = userSession.sessions.map(session => ({
            ...session,
            uptime: calculateUptime(session.createdAt),
          }));
          
          return {
            ...userSession,
            sessions: sessionsWithCalc,
            totalUptime: calculateTotalUptime(sessionsWithCalc),
          };
        });
        
        setSessions(sessionsWithUptime);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidateSession = async (userId: string, sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');
      const currentUserId = currentUser ? JSON.parse(currentUser).userId : null;
      
      const res = await fetch('/api/security/sessions', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'invalidate', userId, sessionId }),
      });
      if (res.ok) {
        if (userId === currentUserId) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          fetchSessions();
        }
      }
    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  };

  const handleInvalidateAllUserSessions = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');
      const currentUserId = currentUser ? JSON.parse(currentUser).userId : null;
      
      const res = await fetch('/api/security/sessions', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'invalidateAll', userId }),
      });
      if (res.ok) {
        if (userId === currentUserId) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          fetchSessions();
        }
      }
    } catch (error) {
      console.error('Error invalidating sessions:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-orange-500/50 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-orange-500/30">
          <div className="flex items-center gap-3">
            <UsersIcon className="text-orange-500" size={24} />
            <h2 className="text-white text-xl font-bold">Active Sessions</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {stats && (
          <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex gap-6">
            <div>
              <div className="text-gray-400 text-sm">Total Sessions</div>
              <div className="text-white text-2xl font-bold">{stats.totalSessions}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Active Users</div>
              <div className="text-white text-2xl font-bold">{stats.activeUsers}</div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Timer className="text-orange-400" size={20} />
              <div>
                <div className="text-gray-400 text-sm">Session Tracking</div>
                <div className="text-orange-200 text-sm font-medium">Uptime Enabled</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 flex gap-2 border-b border-gray-700">
          <button
            onClick={fetchSessions}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No active sessions</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {sessions.map((userSessions) => (
                <div key={userSessions.userId} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {userSessions.userName || `User ID: ${userSessions.userId}`}
                          {userSessions.userRole && (
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              userSessions.userRole === 'admin' 
                                ? 'bg-purple-500/30 text-purple-200' 
                                : userSessions.userRole === 'securityadmin'
                                ? 'bg-cyan-500/30 text-cyan-200'
                                : 'bg-blue-500/30 text-blue-200'
                            }`}>
                              {userSessions.userRole}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{userSessions.sessions.length} active session(s)</div>
                      </div>
                      {userSessions.totalUptime && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg">
                          <Clock className="text-green-400" size={16} />
                          <div>
                            <div className="text-green-200 text-xs">Total Uptime</div>
                            <div className="text-green-100 font-mono text-sm">{userSessions.totalUptime.formatted}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleInvalidateAllUserSessions(userSessions.userId)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <Trash2 size={14} /> Invalidate All
                    </button>
                  </div>
                  <div className="ml-4 space-y-2">
                    {userSessions.sessions.map((session) => (
                      <div key={session.id} className="bg-gray-800/30 p-3 rounded text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-gray-300 font-mono text-xs">{session.id.slice(0, 12)}...</div>
                          <div className="flex items-center gap-3">
                            {session.uptime && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded">
                                <Timer className="text-orange-400" size={14} />
                                <span className="text-orange-200 font-mono text-xs">{session.uptime.formatted}</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleInvalidateSession(userSessions.userId, session.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>IP: {session.ipAddress}</div>
                          <div>Started: {new Date(session.createdAt).toLocaleString()}</div>
                          <div className="col-span-2 truncate">Agent: {session.userAgent?.substring(0, 80)}...</div>
                          <div>Last Activity: {new Date(session.lastActivity).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Timer size={14} />
            <span>Session uptime is tracked from login time. Use this data for work time calculations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
