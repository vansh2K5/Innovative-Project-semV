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
  TrashIcon,
  ShieldIcon,
  GearIcon,
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
    _id?: string;
  };
  assignedTo: any[];
}

interface User {
  _id?: string;
  name: string;
  email: string;
  role: string;
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("user");
  const [userId, setUserId] = useState<string>("");
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [canCreateEvents, setCanCreateEvents] = useState<boolean>(true);
  const [canDeleteEvents, setCanDeleteEvents] = useState<boolean>(true);
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
        setUserId(user._id || user.id || '');

        // Fetch user permissions
        const permissionsResponse = await fetch(`/api/permissions?userId=${user._id || user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();
          const perms = permissionsData.permissions;
          setCanCreateEvents(perms.canCreateEvents);
          setCanDeleteEvents(perms.canDeleteEvents);
        } else {
          // Use default permissions for admins
          if (user.role === 'admin' || user.role === 'securityadmin') {
            setCanCreateEvents(true);
            setCanDeleteEvents(true);
          }
        }

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

  const handleClearAllEvents = async () => {
    if (!confirm('Are you sure you want to delete ALL events? This action cannot be undone!')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear events');
      }

      alert(`Successfully deleted ${data.deletedCount} events`);
      
      // Refresh events
      setLoading(true);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const eventsData = await api.events.getAll({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        limit: 100,
      });

      setEvents(eventsData.events);
      setLoading(false);
    } catch (error: any) {
      console.error('Clear events error:', error);
      alert(error.message || 'Failed to clear events');
      setLoading(false);
    }
  };

  const handleClearMyEvents = async () => {
    if (!confirm('Are you sure you want to delete all YOUR events? This action cannot be undone!')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events/clear-my-events', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear your events');
      }

      alert(`Successfully deleted ${data.deletedCount} of your events`);
      
      // Refresh events
      setLoading(true);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      const eventsData = await api.events.getAll({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        limit: 100,
      });

      setEvents(eventsData.events);
      setLoading(false);
    } catch (error: any) {
      console.error('Clear my events error:', error);
      alert(error.message || 'Failed to clear your events');
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

  const canDeleteEvent = (event: Event): boolean => {
    // Check if user has permission to delete events globally
    if (!canDeleteEvents) return false;
    // Admin can delete any event
    if (userRole === 'admin') return true;
    // Event creator can delete their own events
    const createdById = event.createdBy._id || event.createdBy;
    return createdById === userId || createdById.toString() === userId;
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete the event "${eventTitle}"? This action cannot be undone!`)) {
      return;
    }

    try {
      setDeletingEventId(eventId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to delete this event');
        }
        if (response.status === 404) {
          throw new Error('Event not found or already deleted');
        }
        throw new Error(data.error || data.message || 'Failed to delete event');
      }

      // Remove event from the local state
      setEvents(events.filter(e => e._id !== eventId));
      alert('Event deleted successfully');
    } catch (error: any) {
      console.error('Delete event error:', error);
      alert(error.message || 'Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date()).slice(0, 5);

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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/20 transition-all text-sm"
              >
                <CalendarIcon size={18} />
                <span>Calendar</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/homePage')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-white/20 transition-all text-sm"
            >
              <HomeIcon size={18} />
              <span>Home</span>
            </button>
          )}
          <button
            onClick={() => router.push('/applications')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
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
            onClick={() => router.push('/settings')}
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
      <div className="w-full py-6 px-8 z-10 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <CalendarIcon size={16} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-semibold">Calendar</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 p-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-white text-4xl font-bold select-none">Calendar Overview</h1>
            <div className="flex gap-3">
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={handleClearAllEvents}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <TrashIcon size={20} />
                    Clear All Events
                  </button>
                  <button
                    onClick={handleClearMyEvents}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <TrashIcon size={20} />
                    Clear My Events
                  </button>
                </>
              )}
              {userRole === 'user' && (
                <button
                  onClick={handleClearMyEvents}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  <TrashIcon size={20} />
                  Clear My Events
                </button>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!canCreateEvents}
                className={`flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-transform ${
                  canCreateEvents
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                <PlusIcon size={20} />
                {canCreateEvents ? 'Create Event' : 'Create Event (Disabled)'}
              </button>
            </div>
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-white/20 rounded">{event.priority}</span>
                            {canDeleteEvent(event) && (
                              <button
                                onClick={() => handleDeleteEvent(event._id, event.title)}
                                disabled={deletingEventId === event._id}
                                className="text-xs px-2 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded transition disabled:opacity-50"
                              >
                                {deletingEventId === event._id ? '...' : '✕'}
                              </button>
                            )}
                          </div>
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-white/20 rounded">{event.priority}</span>
                            {canDeleteEvent(event) && (
                              <button
                                onClick={() => handleDeleteEvent(event._id, event.title)}
                                disabled={deletingEventId === event._id}
                                className="text-xs px-2 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded transition disabled:opacity-50"
                              >
                                {deletingEventId === event._id ? '...' : '✕'}
                              </button>
                            )}
                          </div>
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
                      {canDeleteEvent(event) && (
                        <button
                          onClick={() => handleDeleteEvent(event._id, event.title)}
                          disabled={deletingEventId === event._id}
                          className="text-sm px-3 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 rounded transition disabled:opacity-50"
                        >
                          {deletingEventId === event._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
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
    </ProtectedRoute>
  );
};

export default HomePage;
