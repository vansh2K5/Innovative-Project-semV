'use client';

import React, { useState, useEffect } from 'react';
import { ActivityIcon, Download, X, RefreshCw } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  category: string;
  userId?: string;
}

export default function LogsDashboard({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<'all' | 'error' | 'warn' | 'info'>('all');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [level]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = level === 'all' ? '/api/security/logs' : `/api/security/logs?level=${level}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/security/logs?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs.${format}`;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-purple-500/50 rounded-2xl w-full max-w-4xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <ActivityIcon className="text-purple-500" size={24} />
            <h2 className="text-white text-xl font-bold">Activity Logs</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex gap-2 border-b border-gray-700">
          {(['all', 'error', 'warn', 'info'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                level === l
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
          <button
            onClick={fetchLogs}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            CSV
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No logs found</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {logs.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-800/50 transition font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">{log.timestamp}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.level === 'error' ? 'bg-red-600 text-white' :
                      log.level === 'warn' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white">{log.message}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Category: {log.category} {log.userId && `| User: ${log.userId}`}
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
