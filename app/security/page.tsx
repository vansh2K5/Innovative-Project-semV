"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
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

const SecurityPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Admin");
  const [userRole, setUserRole] = useState<string>("admin");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'Admin');
      setUserRole(user.role || 'admin');

      // Verify admin or security admin role
      if (user.role !== 'admin' && user.role !== 'securityadmin') {
        alert('Access Denied: This page is only accessible to Admins');
        router.push('/homePage');
        return;
      }
    }
    setLoading(false);
  }, [router]);

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
        {/* Static Sidebar - Always Visible */}
        <aside className="w-64 h-screen sticky top-0 bg-black/40 backdrop-blur-xl text-white flex-shrink-0 p-6 flex flex-col border-r border-white/10">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{userName}</h3>
              <p className="text-yellow-200 text-xs font-semibold">{userRole === 'securityadmin' ? 'Security Admin' : 'Admin'}</p>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Logout */}
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

        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Aurora background */}
          <div className="absolute inset-0 z-0 w-full overflow-hidden">
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>

          {/* Simple Header */}
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

          {/* Security Content */}
          <div className="relative z-20 p-8">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-white text-4xl font-bold mb-2">Security Dashboard</h1>
                <p className="text-white/70 text-lg">Manage system security, access controls, and monitoring</p>
              </div>

              {/* Security Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Access Control */}
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
                    onClick={() => router.push('/access-control')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Manage Access
                  </button>
                </Card>

                {/* Authentication */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-700">
                      <LockIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Authentication</h2>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Configure authentication methods, password policies, and session management.
                  </p>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    Configure Auth
                  </button>
                </Card>

                {/* Threat Detection */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-700">
                      <AlertTriangleIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Threat Detection</h2>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Monitor and respond to security threats, suspicious activities, and breaches.
                  </p>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    View Threats
                  </button>
                </Card>

                {/* Activity Logs */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                      <ActivityIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Activity Logs</h2>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    View detailed logs of all system activities, user actions, and changes.
                  </p>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    View Logs
                  </button>
                </Card>

                {/* User Sessions */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700">
                      <UsersIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Active Sessions</h2>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Monitor active user sessions and manage session timeouts and security.
                  </p>
                  <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                    View Sessions
                  </button>
                </Card>

                {/* Security Settings */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700">
                      <SettingsIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-white text-xl font-bold">Security Settings</h2>
                  </div>
                  <p className="text-white/70 text-sm mb-4">
                    Configure global security settings, policies, and compliance requirements.
                  </p>
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                    Configure Settings
                  </button>
                </Card>
              </div>

              {/* Info Section */}
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
      </div>
    </ProtectedRoute>
  );
};

export default SecurityPage;
