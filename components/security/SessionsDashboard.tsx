'use client';

import React, { useState, useEffect } from 'react';
import { UsersIcon, X, Trash2, RefreshCw } from 'lucide-react';

interface UserSession {
  userId: string;
  sessions: {
    id: string;
    userAgent: string;
    ipAddress: string;
    createdAt: string;
    lastActivity: string;
  }[];
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
      const interval = setInterval(fetchSessions, 60000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/security/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
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
        // If invalidating current user's session, log them out
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
        // If invalidating current user's sessions, log them out
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

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-orange-500/50 rounded-2xl w-full max-w-4xl max-h-96 flex flex-col">
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
          <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex gap-4">
            <div>
              <div className="text-gray-400 text-sm">Total Sessions</div>
              <div className="text-white text-2xl font-bold">{stats.totalSessions}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Active Users</div>
              <div className="text-white text-2xl font-bold">{stats.activeUsers}</div>
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
                    <div>
                      <div className="text-white font-semibold">User ID: {userSessions.userId}</div>
                      <div className="text-sm text-gray-400">{userSessions.sessions.length} active session(s)</div>
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
                      <div key={session.id} className="bg-gray-800/30 p-2 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <div className="text-gray-300 font-mono text-xs">{session.id.slice(0, 12)}...</div>
                          <button
                            onClick={() => handleInvalidateSession(userSessions.userId, session.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          IP: {session.ipAddress} | Last: {new Date(session.lastActivity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
