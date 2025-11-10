"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateEventModal from "@/components/CreateEventModal";
import {
  LayoutDashboardIcon,
  UsersIcon,
  SettingsIcon,
  ChartPieIcon,
  LogOutIcon,
  CalendarIcon,
  HomeIcon,
  AppWindowIcon,
  PlusIcon
} from "lucide-react";
import api from "@/lib/api";

const AdminPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("Admin");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }

        // Get user info
        const user = JSON.parse(userStr);
        setUserName(user.name || 'Admin');

        // Verify admin role
        if (user.role !== 'admin') {
          router.push('/homePage');
          return;
        }

        // Fetch users count
        const usersData = await api.users.getAll({ page: 1, limit: 1 });
        setTotalUsers(usersData.pagination.total);

        // Fetch upcoming events
        const today = new Date().toISOString();
        const eventsData = await api.events.getAll({ 
          startDate: today,
          limit: 100 
        });
        setUpcomingEvents(eventsData.pagination.total);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Don't redirect on error, just show the error in console
        // User might not have permissions or API might be having issues
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleEventCreated = async () => {
    // Refresh event count after creating a new one
    try {
      const today = new Date().toISOString();
      const eventsData = await api.events.getAll({ 
        startDate: today,
        limit: 100 
      });
      setUpcomingEvents(eventsData.pagination.total);
    } catch (error) {
      console.error('Error refreshing events:', error);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex">

      {/* Admin Sidebar (no toggle button) */}
      <aside
        className={`bg-black/70 text-white flex-shrink-0 p-6 flex flex-col backdrop-blur-xl border-r border-white/20 shadow-2xl rounded-xl transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
        style={{
          minHeight: "100vh",
          boxShadow: isSidebarOpen
            ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
            : "none",
          borderRight: isSidebarOpen
            ? "3px solid rgba(58, 41, 255, 0.3)"
            : "none",
          transition: "width 0.3s cubic-bezier(.4,0,.2,1)"
        }}
        onMouseLeave={() => setIsSidebarOpen(false)}
        onMouseEnter={() => setIsSidebarOpen(true)}
      >
        {isSidebarOpen && (
          <>
            <div className="text-2xl font-bold mb-8 select-none">Admin Panel</div>
            <nav className="flex-1 space-y-2">
              <button onClick={() => router.push('/adminUi')} className="w-full flex items-center px-3 py-2 rounded-lg transition-all bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                <LayoutDashboardIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                <span className="tracking-wide font-semibold">Dashboard</span>
              </button>
              <button onClick={() => alert('Users management coming soon!')} className="w-full flex items-center px-3 py-2 rounded-lg transition-all hover:bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                <UsersIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                <span className="tracking-wide font-semibold">Users</span>
              </button>
              <button onClick={() => alert('Analytics coming soon!')} className="w-full flex items-center px-3 py-2 rounded-lg transition-all hover:bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                <ChartPieIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                <span className="tracking-wide font-semibold">Analytics</span>
              </button>
              <button onClick={() => alert('Settings coming soon!')} className="w-full flex items-center px-3 py-2 rounded-lg transition-all hover:bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                <SettingsIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                <span className="tracking-wide font-semibold">Settings</span>
              </button>
            </nav>
            <div className="mt-auto">
              <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 rounded-lg transition-all hover:bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                <LogOutIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                <span className="tracking-wide font-semibold">Logout</span>
              </button>
            </div>
          </>
        )}
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

        {/* Sticky header */}
        <div
          className={`sticky top-0 w-full h-[110px] flex items-center justify-center transition-transform duration-500 z-10 ${
            isHidden ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="w-4/5 h-[70px] flex items-center justify-between px-10 rounded-full border border-white/30 bg-white/10 shadow-2xl backdrop-blur-2xl" style={{
            boxShadow: "0 8px 32px 0 rgba(31,38,135,0.2)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(18px)"
          }}>
            {/* Left */}
            <div className="flex items-center gap-4 select-none">
              <span>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                </svg>
              </span>
              <span className="text-white text-xl tracking-wide font-bold drop-shadow shadow-indigo-400/40">
                EMS
              </span>
            </div>
            {/* Right */}
            <div className="flex space-x-8 items-center">
              <button onClick={() => router.push('/adminUi')} type="button" className="flex items-center gap-2 text-white text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF50] to-[#FF94B450] shadow-[0_0_18px_0_rgba(58,41,255,0.25)] transition-all">
                <HomeIcon size={18} /> HOME
              </button>
              <button onClick={() => router.push('/homePage')} type="button" className="flex items-center gap-2 text-white/80 text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF30] to-[#FF94B430] hover:shadow-[0_0_18px_0_rgba(58,41,255,0.25)] hover:text-indigo-200 transition-all">
                <CalendarIcon size={18} /> CALENDAR
              </button>
              <button type="button" className="flex items-center gap-2 text-white/80 text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF30] to-[#FF94B430] hover:shadow-[0_0_18px_0_rgba(58,41,255,0.25)] hover:text-indigo-200 transition-all">
                <AppWindowIcon size={18} /> APPS
              </button>
            </div>
          </div>
        </div>

        {/* Example Admin Content */}
        <div className="relative z-20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white text-3xl font-bold select-none">Welcome, {userName}</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <PlusIcon size={20} />
              Create Event
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            <Card className="bg-white/15 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-7 transition-all hover:shadow-[0_8px_32px_0_rgba(58,41,255,.25)] hover:scale-[1.015]">
              <h2 className="text-white font-semibold text-lg mb-2">Total Users</h2>
              <p className="text-white/70 text-sm">
                {loading ? 'Loading...' : `${totalUsers} Active Users`}
              </p>
            </Card>
            <Card className="bg-white/15 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-7 transition-all hover:shadow-[0_8px_32px_0_rgba(58,41,255,.25)] hover:scale-[1.015] cursor-pointer" onClick={() => router.push('/homePage')}>
              <h2 className="text-white font-semibold text-lg mb-2">Calendar</h2>
              <p className="text-white/70 text-sm">
                {loading ? 'Loading...' : `${upcomingEvents} Upcoming Events`}
              </p>
            </Card>
            <Card className="bg-white/15 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-7 transition-all hover:shadow-[0_8px_32px_0_rgba(58,41,255,.25)] hover:scale-[1.015]">
              <h2 className="text-white font-semibold text-lg mb-2">Apps</h2>
              <p className="text-white/70 text-sm">Manage your applications</p>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default function Page() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminPage />
    </ProtectedRoute>
  );
}
