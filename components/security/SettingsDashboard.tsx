'use client';

import React, { useState, useEffect } from 'react';
import { SettingsIcon, X } from 'lucide-react';

interface SecuritySettings {
  helmet: {
    contentSecurityPolicy: boolean;
    xssFilter: boolean;
    frameOptions: string;
    hstsMaxAge: number;
  };
  sessions: {
    maxAge: number;
    maxConcurrentSessions: number;
    sessionTimeout: number;
  };
}

export default function SettingsDashboard({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchSettings();
    }
  }, [mounted]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/security/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl w-full max-w-4xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-yellow-500/30">
          <div className="flex items-center gap-3">
            <SettingsIcon className="text-yellow-500" size={24} />
            <h2 className="text-white text-xl font-bold">Security Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading settings...</div>
          ) : settings ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-3">HTTP Security Headers (Helmet.js)</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Content Security Policy</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      settings.helmet.contentSecurityPolicy ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
                    }`}>
                      {settings.helmet.contentSecurityPolicy ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">XSS Filter</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      settings.helmet.xssFilter ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
                    }`}>
                      {settings.helmet.xssFilter ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Frame Options</span>
                    <span className="text-gray-200">{settings.helmet.frameOptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">HSTS Max Age (seconds)</span>
                    <span className="text-gray-200">{settings.helmet.hstsMaxAge.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Session Configuration</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Session Max Age (ms)</span>
                    <span className="text-gray-200">{settings.sessions.maxAge.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Max Concurrent Sessions</span>
                    <span className="text-gray-200">{settings.sessions.maxConcurrentSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Session Timeout (ms)</span>
                    <span className="text-gray-200">{settings.sessions.sessionTimeout.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-blue-300 font-semibold mb-2">Security Stack</h4>
                <div className="text-sm text-blue-200 space-y-1">
                  <div>✓ Helmet.js - HTTP security headers</div>
                  <div>✓ Express Session - Session management</div>
                  <div>✓ Keycloak - Authentication & SSO</div>
                  <div>✓ Rate Limiting - DDoS protection</div>
                  <div>✓ Threat Detection - Anomaly detection</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-400">Failed to load settings</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
