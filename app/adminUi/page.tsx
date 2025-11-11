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
  PlusIcon,
  Edit2Icon,
  TrashIcon,
  XIcon,
  SaveIcon,
  MailIcon,
  ShieldIcon
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
  const [showUsersModal, setShowUsersModal] = useState<boolean>(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user' });
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

  const fetchUsers = async () => {
    try {
      const usersData = await api.users.getAll({ page: 1, limit: 100 });
      console.log('Fetched users:', usersData.users);
      console.log('First user sample:', usersData.users[0]);
      setUsers(usersData.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    console.log('=== SAVING USER ===');
    console.log('Editing user:', editingUser);
    console.log('User ID:', editingUser._id);
    console.log('Update data:', { name: editForm.name, role: editForm.role });
    console.log('==================');
    
    try {
      // Only send fields that the backend accepts
      const updateData: any = {
        name: editForm.name,
        role: editForm.role,
      };
      
      const result = await api.users.update(editingUser._id, updateData);
      console.log('Update successful:', result);
      
      setEditingUser(null);
      fetchUsers();
      // Refresh total users count
      const usersData = await api.users.getAll({ page: 1, limit: 1 });
      setTotalUsers(usersData.pagination.total);
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('=== UPDATE USER ERROR ===');
      console.error('Error object:', error);
      console.error('Error name:', error.name);
      console.error('Error status:', error.status);
      console.error('Error serverMessage:', error.serverMessage);
      console.error('User ID attempted:', editingUser._id);
      console.error('========================');
      
      const errorMessage = error.serverMessage || 'Failed to update user';
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Check if trying to delete current user
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    // Check both userId and _id fields
    const isDeletingSelf = currentUser && (currentUser.userId === userId || currentUser._id === userId);
    
    // Prevent admins from deleting their own account
    if (isDeletingSelf) {
      alert('You cannot delete your own account. Please ask another administrator to delete your account if needed.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await api.users.delete(userId);
      
      fetchUsers();
      // Refresh total users count
      const usersData = await api.users.getAll({ page: 1, limit: 1 });
      setTotalUsers(usersData.pagination.total);
      alert('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.serverMessage || 'Failed to delete user';
      alert(errorMessage);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      alert('Please fill in all fields');
      return;
    }

    if (createForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      console.log('Creating user with data:', {
        name: createForm.name,
        email: createForm.email,
        role: createForm.role,
      });

      const result = await api.users.create({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
      });

      console.log('User created successfully:', result);
      
      setShowCreateUserModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      
      // Refresh users list
      if (showUsersModal) {
        fetchUsers();
      }
      
      // Refresh total users count
      const usersData = await api.users.getAll({ page: 1, limit: 1 });
      setTotalUsers(usersData.pagination.total);
      
      alert(`User created successfully!\n\nLogin Credentials:\nEmail: ${createForm.email}\nPassword: ${createForm.password}\n\nPlease save these credentials.`);
    } catch (error: any) {
      console.error('=== CREATE USER ERROR ===');
      console.error('Error object:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error serverMessage:', error.serverMessage);
      console.error('========================');
      
      let errorMessage = 'Failed to create user';
      
      if (error.name === 'APIError') {
        if (error.status === 409) {
          errorMessage = 'A user with this email already exists';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create users';
        } else {
          errorMessage = error.serverMessage || 'Failed to create user';
        }
      }
      
      alert(errorMessage);
    }
  };

  useEffect(() => {
    if (showUsersModal) {
      fetchUsers();
    }
  }, [showUsersModal]);

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
              <button onClick={() => setShowUsersModal(true)} className="w-full flex items-center px-3 py-2 rounded-lg transition-all hover:bg-[#3A29FF33] hover:scale-105 group shadow-sm active:bg-white/40">
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
              <button 
                onClick={() => router.push('/applications')}
                type="button" 
                className="flex items-center gap-2 text-white/80 text-base font-semibold tracking-wide px-5 py-2 rounded-md bg-gradient-to-br from-[#3A29FF30] to-[#FF94B430] hover:shadow-[0_0_18px_0_rgba(58,41,255,0.25)] hover:text-indigo-200 transition-all"
              >
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

      {/* Users Management Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUsersModal(false)}>
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border border-white/30 rounded-2xl shadow-2xl backdrop-blur-xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                <UsersIcon size={28} />
                User Management
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <PlusIcon size={18} />
                  Create User
                </button>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
                >
                  <XIcon size={24} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-white/70 text-lg">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon size={48} className="mx-auto text-white/30 mb-4" />
                <p className="text-white/70 text-lg">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/15 transition"
                  >
                    {editingUser && editingUser._id === user._id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-white/70 text-sm mb-1 block">Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="text-white/70 text-sm mb-1 block">Email (Read-only)</label>
                            <input
                              type="email"
                              value={editForm.email}
                              readOnly
                              disabled
                              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/70 text-sm mb-1 block">Role</label>
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="user" className="bg-purple-900">User</option>
                            <option value="admin" className="bg-purple-900">Admin</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2"
                          >
                            <XIcon size={16} />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveUser}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <SaveIcon size={16} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-bold text-lg">{user.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50' 
                                : 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                            }`}>
                              <ShieldIcon size={12} className="inline mr-1" />
                              {user.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70 text-sm">
                            <MailIcon size={14} />
                            {user.email}
                          </div>
                          <div className="text-white/50 text-xs mt-1">
                            Created: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700 transition"
                            title="Edit user"
                          >
                            <Edit2Icon size={18} />
                          </button>
                          {(() => {
                            const currentUserStr = localStorage.getItem('user');
                            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
                            const isCurrentUser = currentUser && (currentUser.userId === user._id || currentUser._id === user._id);
                            
                            if (isCurrentUser) {
                              return (
                                <button
                                  disabled
                                  className="p-2 bg-gray-600/50 text-white/50 rounded-lg cursor-not-allowed"
                                  title="You cannot delete your own account"
                                >
                                  <TrashIcon size={18} />
                                </button>
                              );
                            }
                            
                            return (
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700 transition"
                                title="Delete user"
                              >
                                <TrashIcon size={18} />
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateUserModal(false)}>
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border border-white/30 rounded-2xl shadow-2xl backdrop-blur-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl font-bold flex items-center gap-2">
                <PlusIcon size={28} />
                Create New User
              </h2>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-white/70 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/90 text-sm font-semibold mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-white/90 text-sm font-semibold mb-2 block">Email Address *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-white/90 text-sm font-semibold mb-2 block">Password *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-white/50 text-xs mt-1">Password must be at least 6 characters</p>
              </div>

              <div>
                <label className="text-white/90 text-sm font-semibold mb-2 block">Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user" className="bg-purple-900">User</option>
                  <option value="admin" className="bg-purple-900">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateUserModal(false);
                    setCreateForm({ name: '', email: '', password: '', role: 'user' });
                  }}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  <PlusIcon size={18} />
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
