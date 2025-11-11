"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import CreateEventModal from "@/components/CreateEventModal";
import {
  CalendarIcon,
  HomeIcon,
  AppWindowIcon,
  PlusIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import api from "@/lib/api";

interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  priority: string;
  status: string;
  location?: string;
  createdBy: {
    name: string;
    email: string;
  };
  assignedTo: any[];
}

const HomePage: React.FC = () => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("user");
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }

        // Get user info
        const user = JSON.parse(userStr);
        setUserName(user.name || 'User');
        setUserRole(user.role || 'user');

        // Fetch events for the current month
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        const eventsData = await api.events.getAll({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          limit: 100,
        });

        setEvents(eventsData.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate, router]);

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
    // Refresh events after creating a new one
    setLoading(true);
    try {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const eventsData = await api.events.getAll({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        limit: 100,
      });

      setEvents(eventsData.events);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      case 'low':
        return 'bg-green-500/20 border-green-500/50 text-green-200';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return '👥';
      case 'deadline':
        return '⏰';
      case 'task':
        return '✓';
      case 'reminder':
        return '🔔';
      default:
        return '📅';
    }
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date()).slice(0, 5);

  return (
    <div className="relative min-h-screen w-full flex">
      {/* Sidebar */}
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
            <div className="text-2xl font-bold mb-8 select-none">Calendar</div>
            <nav className="flex-1 space-y-2">
              {userRole === 'admin' && (
                <button onClick={() => router.push('/adminUi')} className="w-full flex items-center px-3 py-2 rounded-lg transition-all hover:bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                  <HomeIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                  <span className="tracking-wide font-semibold">Admin Panel</span>
                </button>
              )}
              <button onClick={() => router.push('/homePage')} className="w-full flex items-center px-3 py-2 rounded-lg transition-all bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
                <CalendarIcon className="mr-3 group-hover:text-indigo-300 transition-colors" />
                <span className="tracking-wide font-semibold">Calendar</span>
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
        <div className="w-4/5 h-[70px] flex items-center justify-between px-10 rounded-full border border-white/30 bg-white/10 shadow-2xl backdrop-blur-2xl">
          {/* Left */}
          <div className="flex items-center gap-4 select-none">
            <span>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-white text-xl tracking-wide font-bold drop-shadow">
              EMS
            </span>
          </div>
          {/* Right */}
          <div className="flex space-x-8 items-center">
            {userRole === 'admin' && (
              <button
                onClick={() => router.push('/adminUi')}
                type="button"
                className="flex items-center gap-2 text-white/80 text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF30] to-[#FF94B430] hover:shadow-[0_0_18px_0_rgba(58,41,255,0.25)] hover:text-indigo-200 transition-all"
              >
                <HomeIcon size={18} /> ADMIN
              </button>
            )}
            <button
              onClick={() => router.push('/homePage')}
              type="button"
              className="flex items-center gap-2 text-white text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF50] to-[#FF94B450] shadow-[0_0_18px_0_rgba(58,41,255,0.25)] transition-all"
            >
              <CalendarIcon size={18} /> CALENDAR
            </button>
            <button
              onClick={() => router.push('/applications')}
              type="button"
              className="flex items-center gap-2 text-white/80 text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF30] to-[#FF94B430] hover:shadow-[0_0_18px_0_rgba(58,41,255,0.25)] hover:text-indigo-200 transition-all"
            >
              <AppWindowIcon size={18} /> APPS
            </button>
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-2 text-white/80 text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-red-500/30 to-pink-500/30 hover:shadow-[0_0_18px_0_rgba(255,0,0,0.25)] hover:text-red-200 transition-all"
            >
              <LogOutIcon size={18} /> LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-white text-4xl font-bold select-none">Calendar Overview</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <PlusIcon size={20} />
              Create Event
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-white text-2xl font-bold">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-white/70 font-semibold py-2">
                      {day}
                    </div>
                  ))}
                  
                  {getDaysInMonth().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dayEvents = getEventsForDate(date);
                    const isToday =
                      date.getDate() === new Date().getDate() &&
                      date.getMonth() === new Date().getMonth() &&
                      date.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setClickedDate(date);
                          setShowDateModal(true);
                        }}
                        className={`aspect-square p-2 rounded-lg border transition-all cursor-pointer ${
                          isToday
                            ? 'bg-purple-500/30 border-purple-400/50'
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-white text-sm font-semibold mb-1">{date.getDate()}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event._id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(event.priority)}`}
                              title={event.title}
                            >
                              {getTypeIcon(event.type)} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-white/60">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Events */}
              <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">Today's Events</h3>
                {loading ? (
                  <p className="text-white/70">Loading...</p>
                ) : todayEvents.length === 0 ? (
                  <p className="text-white/70">No events today</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div
                        key={event._id}
                        className={`p-3 rounded-lg border ${getPriorityColor(event.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg">{getTypeIcon(event.type)}</span>
                          <span className="text-xs px-2 py-1 bg-white/20 rounded">{event.priority}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-xs opacity-70 mb-2">{event.description}</p>
                        )}
                        <div className="space-y-1 text-xs opacity-80">
                          <div className="flex items-center gap-2">
                            <ClockIcon size={12} />
                            <span>Start: {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon size={12} />
                            <span>End: {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(event.endDate)}</span>
                          </div>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs opacity-80 mt-2">
                            <MapPinIcon size={12} />
                            {event.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Upcoming Events */}
              <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">Upcoming Events</h3>
                {loading ? (
                  <p className="text-white/70">Loading...</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-white/70">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event._id}
                        className={`p-3 rounded-lg border ${getPriorityColor(event.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg">{getTypeIcon(event.type)}</span>
                          <span className="text-xs px-2 py-1 bg-white/20 rounded">{event.priority}</span>
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1">{event.title}</h4>
                        {event.description && (
                          <p className="text-xs text-white/60 mb-2 line-clamp-2">{event.description}</p>
                        )}
                        <div className="space-y-1 text-xs text-white/70">
                          <div className="flex items-center gap-2">
                            <ClockIcon size={12} />
                            <span>Start: {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(event.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon size={12} />
                            <span>End: {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(event.endDate)}</span>
                          </div>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-white/70 mt-2">
                            <MapPinIcon size={12} />
                            {event.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Date Events Modal */}
      {showDateModal && clickedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDateModal(false)}>
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border border-white/30 rounded-2xl shadow-2xl backdrop-blur-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl font-bold">
                Events on {clickedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
              >
                ✕
              </button>
            </div>

            {getEventsForDate(clickedDate).length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon size={48} className="mx-auto text-white/30 mb-4" />
                <p className="text-white/70 text-lg">No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(clickedDate).map((event) => (
                  <div
                    key={event._id}
                    className={`p-4 rounded-lg border ${getPriorityColor(event.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(event.type)}</span>
                        <div>
                          <h3 className="text-white font-bold text-lg">{event.title}</h3>
                          <span className="text-xs px-2 py-1 bg-white/20 rounded mt-1 inline-block">{event.priority}</span>
                        </div>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-white/80 text-sm mb-3 pl-11">{event.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-white/90 pl-11">
                      <div className="flex items-center gap-2">
                        <ClockIcon size={14} />
                        <span className="font-semibold">Start:</span>
                        <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon size={14} />
                        <span className="font-semibold">End:</span>
                        <span>{new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(event.endDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPinIcon size={14} />
                          <span className="font-semibold">Location:</span>
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <UsersIcon size={14} />
                        <span className="font-semibold">Created by:</span>
                        <span>{event.createdBy.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
