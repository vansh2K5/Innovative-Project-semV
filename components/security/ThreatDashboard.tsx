'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon, RefreshCw, X, Check } from 'lucide-react';

interface Threat {
  id: string;
  type: string;
  level: string;
  ip: string;
  timestamp: Date;
  status: string;
  details: string;
}

export default function ThreatDashboard({ onClose }: { onClose: () => void }) {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchThreats = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' ? '/api/security/threats' : `/api/security/threats?level=${filter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setThreats(data.threats || []);
      }
    } catch (error) {
      console.error('Error fetching threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async (ip: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/security/threats', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'blockIP', ip, reason: 'Admin block' }),
      });
      if (res.ok) {
        fetchThreats();
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
    }
  };

  const handleUpdateStatus = async (threatId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/security/threats', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'updateStatus', threatId, status }),
      });
      if (res.ok) {
        fetchThreats();
      }
    } catch (error) {
      console.error('Error updating threat status:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-4xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="text-red-500" size={24} />
            <h2 className="text-white text-xl font-bold">Threat Detection</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex gap-2 border-b border-gray-700">
          {(['all', 'critical', 'high', 'medium'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={fetchThreats}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading threats...</div>
          ) : threats.length === 0 ? (
            <div className="p-8 text-center text-green-400">No threats detected</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {threats.map((threat) => (
                <div key={threat.id} className="p-4 hover:bg-gray-800/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-white font-semibold">{threat.type}</div>
                      <div className="text-sm text-gray-400">{threat.details}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      threat.level === 'critical' ? 'bg-red-600 text-white' :
                      threat.level === 'high' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {threat.level}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>IP: {threat.ip}</span>
                    <span>Status: {threat.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(threat.id, 'resolved')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <Check size={16} /> Resolve
                    </button>
                    <button
                      onClick={() => handleBlockIP(threat.ip)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Block IP
                    </button>
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
