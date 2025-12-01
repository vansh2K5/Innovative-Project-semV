"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import ThreatDashboard from "@/components/security/ThreatDashboard";
import LogsDashboard from "@/components/security/LogsDashboard";
import SessionsDashboard from "@/components/security/SessionsDashboard";
import AuthConfigDashboard from "@/components/security/AuthConfigDashboard";
import SettingsDashboard from "@/components/security/SettingsDashboard";
import AccessControlDashboard from "@/components/security/AccessControlDashboard";
import {
  ShieldIcon,
  HomeIcon,
  CalendarIcon,
  AppWindowIcon,
  LogOutIcon,
  SettingsIcon,
  KeyIcon,
  LockIcon,
  AlertTriangleIcon,
  ActivityIcon,
  UsersIcon,
} from "lucide-react";
import api from "@/lib/api";

interface SecurityStats {
  threats: { totalThreats: number; byLevel: { critical: number; high: number; medium: number; low: number } };
  logs: { totalLogs: number; byLevel: { error: number; warn: number; info: number } };
  sessions: { totalSessions: number; activeUsers: number };
}

const SecurityPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Admin");
  const [userRole, setUserRole] = useState<string>("admin");
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'Admin');
      setUserRole(user.role || 'admin');

      if (user.role !== 'admin' && user.role !== 'securityadmin') {
        alert('Access Denied: This page is only accessible to Admins');
        router.push('/homePage');
        return;
      }
    }
    
    fetchSecurityStats();
    setLoading(false);
  }, [router]);

  const fetchSecurityStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [threatsRes, logsRes, sessionsRes] = await Promise.all([
        fetch('/api/security/threats?statsOnly=true', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/security/logs?statsOnly=true', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/security/sessions?statsOnly=true', { headers }).then(r => r.ok ? r.json() : null),
      ]);

      setStats({
        threats: threatsRes || { totalThreats: 0, byLevel: { critical: 0, high: 0, medium: 0, low: 0 } },
        logs: logsRes || { totalLogs: 0, byLevel: { error: 0, warn: 0, info: 0 } },
        sessions: sessionsRes || { totalSessions: 0, activeUsers: 0 },
      });
    } catch (error) {
      console.error('Error fetching security stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen w-full flex bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        <aside className="w-64 h-screen sticky top-0 bg-black/40 backdrop-blur-xl text-white flex-shrink-0 p-6 flex flex-col border-r border-white/10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{userName}</h3>
              <p className="text-yellow-200 text-xs font-semibold">{userRole === 'securityadmin' ? 'Security Admin' : 'Admin'}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <button
              onClick={() => router.push('/adminUi')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <HomeIcon size={18} />
              <span>Admin Home</span>
            </button>
            <button
              onClick={() => router.push('/homePage')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <CalendarIcon size={18} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => router.push('/applications')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <AppWindowIcon size={18} />
              <span>Applications</span>
            </button>
            <button
              onClick={() => router.push('/security')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/20 transition-all text-sm"
            >
              <ShieldIcon size={18} />
              <span>Security</span>
            </button>
            <button
              onClick={() => alert('Settings coming soon!')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <SettingsIcon size={18} />
              <span>Settings</span>
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
            >
              <LogOutIcon size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 relative">
          <div className="absolute inset-0 z-0 w-full overflow-hidden">
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>

          <div className="w-full py-6 px-8 z-10 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-md border-b border-yellow-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <ShieldIcon size={16} className="text-white" />
                </div>
                <h1 className="text-white text-xl font-semibold">Security Management</h1>
              </div>
            </div>
          </div>

          <div className="relative z-20 p-8">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-white text-4xl font-bold mb-2">Security Dashboard</h1>
                <p className="text-white/70 text-lg">Manage system security, access controls, and monitoring</p>
              </div>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-xl">
                    <div className="text-red-200 text-sm">Critical Threats</div>
                    <div className="text-white text-3xl font-bold">{stats.threats.byLevel?.critical || 0}</div>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-xl">
                    <div className="text-yellow-200 text-sm">Active Warnings</div>
                    <div className="text-white text-3xl font-bold">{(stats.threats.byLevel?.high || 0) + (stats.threats.byLevel?.medium || 0)}</div>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-xl">
                    <div className="text-blue-200 text-sm">Active Sessions</div>
                    <div className="text-white text-3xl font-bold">{stats.sessions.totalSessions || 0}</div>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-xl">
                    <div className="text-purple-200 text-sm">Total Log Entries</div>
                    <div className="text-white text-3xl font-bold">{stats.logs.totalLogs || 0}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                      <KeyIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Access Control</h2>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Manage user permissions, roles, and access levels across the system.
                  </p>
                  <button 
                    onClick={() => setOpenPanel("access")}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Manage Access
                  </button>
                </Card>

                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-700">
                      <LockIcon size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold">Authentication</h2>
                      <span className="text-green-300 text-xs">Keycloak Integration</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Configure SSO, password policies, MFA, and session management via Keycloak.
                  </p>
                  <button 
                    onClick={() => setOpenPanel("auth")}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Configure Auth
                  </button>
                </Card>

                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-700">
                      <AlertTriangleIcon size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold">Threat Detection</h2>
                      <span className="text-red-300 text-xs">Wazuh Integration</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-2">
                    Monitor threats, brute force attacks, and suspicious activities.
                  </p>
                  {stats && (
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-red-500/30 text-red-200 text-xs rounded">
                        {stats.threats.totalThreats} total threats
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => setOpenPanel("threats")}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    View Threats
                  </button>
                </Card>

                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                      <ActivityIcon size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold">Activity Logs</h2>
                      <span className="text-purple-300 text-xs">Grafana Loki Compatible</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-2">
                    View detailed logs of all system activities with Loki export support.
                  </p>
                  {stats && (
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded">
                        {stats.logs.totalLogs} entries
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => setOpenPanel("logs")}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    View Logs
                  </button>
                </Card>

                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700">
                      <UsersIcon size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold">Active Sessions</h2>
                      <span className="text-orange-300 text-xs">Express Session Manager</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-2">
                    Monitor and manage active user sessions with timeout controls.
                  </p>
                  {stats && (
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-orange-500/30 text-orange-200 text-xs rounded">
                        {stats.sessions.activeUsers} active users
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => setOpenPanel("sessions")}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    View Sessions
                  </button>
                </Card>

                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700">
                      <SettingsIcon size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-xl font-bold">Security Settings</h2>
                      <span className="text-yellow-300 text-xs">Helmet.js Protection</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Configure HTTP security headers, CSP, XSS protection, and HSTS.
                  </p>
                  <button 
                    onClick={() => setOpenPanel("settings")}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Configure Settings
                  </button>
                </Card>
              </div>

              <div className="mt-12 p-6 rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl">
                <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                  <ShieldIcon size={24} className="text-yellow-400" />
                  Admin Security Access
                </h3>
                <p className="text-white/70 leading-relaxed">
                  As an Admin, you have access to the Security Management dashboard. 
                  This area allows you to monitor system security, manage access controls, review activity logs, 
                  and configure security policies. Use these tools responsibly to maintain the integrity and 
                  security of the entire system.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-sm border border-yellow-400/30">
                    🔒 Exclusive Access
                  </span>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-200 text-sm border border-orange-400/30">
                    🛡️ Advanced Security
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-sm border border-red-400/30">
                    ⚠️ High Privilege
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {openPanel === "threats" && <ThreatDashboard onClose={() => setOpenPanel(null)} />}
        {openPanel === "logs" && <LogsDashboard onClose={() => setOpenPanel(null)} />}
        {openPanel === "sessions" && <SessionsDashboard onClose={() => setOpenPanel(null)} />}
        {openPanel === "auth" && <AuthConfigDashboard onClose={() => setOpenPanel(null)} />}
        {openPanel === "settings" && <SettingsDashboard onClose={() => setOpenPanel(null)} />}
        {openPanel === "access" && <AccessControlDashboard onClose={() => setOpenPanel(null)} />}
      </div>
    </ProtectedRoute>
  );
};

export default SecurityPage;
