'use client';

import React, { useState, useEffect } from 'react';
import { LockIcon, X, Save } from 'lucide-react';

interface AuthConfig {
  keycloak: {
    enabled: boolean;
    serverUrl?: string;
    realm?: string;
    clientId?: string;
  };
  features: {
    ssoEnabled: boolean;
    mfaSupported: boolean;
    passwordPolicies: Record<string, any>;
    sessionSettings: Record<string, any>;
  };
}

export default function AuthConfigDashboard({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/security/auth-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching auth config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-green-500/50 rounded-2xl w-full max-w-4xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <LockIcon className="text-green-500" size={24} />
            <h2 className="text-white text-xl font-bold">Authentication Config</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400">Loading configuration...</div>
          ) : config ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-3">Keycloak Integration</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      config.keycloak.enabled
                        ? 'bg-green-600/50 text-green-200'
                        : 'bg-gray-600/50 text-gray-200'
                    }`}>
                      {config.keycloak.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {config.keycloak.serverUrl && (
                    <>
                      <div className="text-sm text-gray-400">
                        Server: <span className="text-gray-200">{config.keycloak.serverUrl}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Realm: <span className="text-gray-200">{config.keycloak.realm || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Security Features</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">SSO Enabled</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      config.features.ssoEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
                    }`}>
                      {config.features.ssoEnabled ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">MFA Supported</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      config.features.mfaSupported ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200'
                    }`}>
                      {config.features.mfaSupported ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Password Policies</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Min Length:</span>
                    <span className="text-gray-200">{config.features.passwordPolicies?.minLength || 8}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Require Uppercase:</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Require Numbers:</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Max Age (days):</span>
                    <span className="text-gray-200">{config.features.passwordPolicies?.maxAge || 90}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Session Settings</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Idle Timeout (min):</span>
                    <span className="text-gray-200">{config.features.sessionSettings?.idleTimeout || 30}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Absolute Timeout (min):</span>
                    <span className="text-gray-200">{config.features.sessionSettings?.absoluteTimeout || 480}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Concurrent Sessions:</span>
                    <span className="text-gray-200">{config.features.sessionSettings?.concurrentSessions || 5}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-400">Failed to load configuration</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
