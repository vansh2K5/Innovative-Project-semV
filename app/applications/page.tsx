"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  CalendarIcon,
  HomeIcon,
  AppWindowIcon,
  LogOutIcon,
  SettingsIcon,
  FileTextIcon,
  PresentationIcon,
  FileSpreadsheetIcon,
  ExternalLinkIcon,
  UsersIcon,
  VideoIcon,
  LayoutDashboardIcon,
  ChartPieIcon,
  ShieldIcon,
} from "lucide-react";
import api from "@/lib/api";

const ApplicationsPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("user");
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'User');
      setUserRole(user.role || 'user');
    }
  }, []);

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

  const openOfficeApps = [
    {
      name: "Writer",
      description: "Word processor for creating documents, letters, and reports",
      icon: FileTextIcon,
      url: "https://www.offidocs.com/community/webofficenewdoc.php",
      color: "from-blue-500 to-blue-700",
      bgGradient: "from-blue-500/20 to-blue-700/20",
    },
    {
      name: "Calc",
      description: "Spreadsheet application for data analysis and calculations",
      icon: FileSpreadsheetIcon,
      url: "https://www.offidocs.com/community/webofficenewxls.php",
      color: "from-green-500 to-green-700",
      bgGradient: "from-green-500/20 to-green-700/20",
    },
    {
      name: "Impress",
      description: "Presentation software for creating slideshows",
      icon: PresentationIcon,
      url: "https://www.offidocs.com/community/webofficenewppt.php",
      color: "from-orange-500 to-orange-700",
      bgGradient: "from-orange-500/20 to-orange-700/20",
    },
    {
      name: "Google Meet",
      description: "Video conferencing and online meetings",
      icon: VideoIcon,
      url: "https://meet.google.com/",
      color: "from-purple-500 to-purple-700",
      bgGradient: "from-purple-500/20 to-purple-700/20",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen w-full flex bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        {/* Static Sidebar - Always Visible */}
        <aside className="w-64 h-screen sticky top-0 bg-black/40 backdrop-blur-xl text-white flex-shrink-0 p-6 flex flex-col border-r border-white/10">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{userName}</h3>
              <p className="text-white/60 text-xs capitalize">{userRole}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {(userRole === 'admin' || userRole === 'securityadmin') ? (
              <>
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
              </>
            ) : (
              <button
                onClick={() => router.push('/homePage')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
              >
                <HomeIcon size={18} />
                <span>Home</span>
              </button>
            )}
            <button
              onClick={() => router.push('/applications')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/20 transition-all text-sm"
            >
              <AppWindowIcon size={18} />
              <span>Applications</span>
            </button>
            {(userRole === 'admin' || userRole === 'securityadmin') && (
              <button
                onClick={() => router.push('/security')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all text-sm font-semibold"
              >
                <ShieldIcon size={18} />
                <span>Security</span>
              </button>
            )}
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
          <div className="absolute inset-0 z-0 w-full min-w-screen overflow-hidden">
            <Aurora
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>

          {/* Simple Header */}
          <div className="sticky top-0 w-full py-6 px-8 z-10 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <AppWindowIcon size={16} className="text-white" />
                </div>
                <h1 className="text-white text-xl font-semibold">Office Applications</h1>
              </div>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="relative z-20 p-8">
            <div className="w-full">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-white text-3xl font-bold mb-2">
                  Productivity Suite
                </h2>
                <p className="text-white/70 text-lg">
                  Access powerful office applications and video conferencing directly in your browser
                </p>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {openOfficeApps.map((app, index) => {
                  const IconComponent = app.icon;
                  return (
                    <div
                      key={index}
                      className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${app.bgGradient} backdrop-blur-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-${app.color}/50`}
                    >
                      {/* Background Gradient Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-4 rounded-xl bg-gradient-to-br ${app.color} shadow-lg`}>
                            <IconComponent size={32} className="text-white" />
                          </div>
                          <ExternalLinkIcon size={20} className="text-white/50 group-hover:text-white transition" />
                        </div>
                        
                        <h3 className="text-white text-2xl font-bold mb-2">
                          {app.name}
                        </h3>
                        <p className="text-white/70 text-sm mb-6">
                          {app.description}
                        </p>
                        
                        <button
                          onClick={() => window.open(app.url, '_blank')}
                          className={`w-full px-6 py-3 rounded-lg bg-gradient-to-r ${app.color} text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
                        >
                          Open {app.name}
                          <ExternalLinkIcon size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Section */}
              <div className="mt-12 p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                  <AppWindowIcon size={24} />
                  About Productivity Suite
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Access a complete set of productivity tools directly in your browser. Create documents with Writer, 
                  analyze data with Calc, design presentations with Impress, and collaborate with your team using Google Meet. 
                  All applications are web-based, requiring no installation, and are fully compatible with popular office formats.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-sm border border-blue-400/30">
                    No Installation Required
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-200 text-sm border border-green-400/30">
                    Free & Open Source
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-sm border border-purple-400/30">
                    MS Office Compatible
                  </span>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-200 text-sm border border-orange-400/30">
                    Video Conferencing
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

export default ApplicationsPage;
