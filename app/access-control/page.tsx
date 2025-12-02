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
  UsersIcon,
  MailIcon,
  Edit2Icon,
  SaveIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AccessPermissions {
  canViewCalendar: boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewApplications: boolean;
  canManageUsers: boolean;
  canAccessSecurity: boolean;
}

const AccessControlPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Admin");
  const [userRole, setUserRole] = useState<string>("admin");
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<AccessPermissions>({
    canViewCalendar: true,
    canCreateEvents: true,
    canEditEvents: false,
    canDeleteEvents: false,
    canViewApplications: true,
    canManageUsers: false,
    canAccessSecurity: false,
  });
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
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const usersData = await api.users.getAll({ page: 1, limit: 100 });
      setUsers(usersData.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    
    try {
      // Fetch permissions from API
      const response = await api.permissions.get(user._id);
      if (response.permissions) {
        setPermissions({
          canViewCalendar: response.permissions.canViewCalendar,
          canCreateEvents: response.permissions.canCreateEvents,
          canEditEvents: response.permissions.canEditEvents,
          canDeleteEvents: response.permissions.canDeleteEvents,
          canViewApplications: response.permissions.canViewApplications,
          canManageUsers: response.permissions.canManageUsers,
          canAccessSecurity: response.permissions.canAccessSecurity,
        });
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Set default permissions based on role if API fails
      if (user.role === 'admin') {
        setPermissions({
          canViewCalendar: true,
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canViewApplications: true,
          canManageUsers: true,
          canAccessSecurity: true,
        });
      } else if (user.role === 'securityadmin') {
        setPermissions({
          canViewCalendar: true,
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: false,
          canViewApplications: true,
          canManageUsers: true,
          canAccessSecurity: true,
        });
      } else {
        setPermissions({
          canViewCalendar: true,
          canCreateEvents: true,
          canEditEvents: false,
          canDeleteEvents: false,
          canViewApplications: true,
          canManageUsers: false,
          canAccessSecurity: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await api.permissions.update(selectedUser._id, permissions);
      alert(`Permissions updated successfully for ${selectedUser.name}!`);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      alert(error.serverMessage || 'Failed to save permissions');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/30 text-purple-200 border-purple-400/50';
      case 'securityadmin':
        return 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border-cyan-400/50';
      default:
        return 'bg-blue-500/30 text-blue-200 border-blue-400/50';
    }
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircleIcon size={20} className="text-green-400" />
    ) : (
      <XCircleIcon size={20} className="text-red-400" />
    );
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen w-full flex bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        {/* Static Sidebar */}
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all text-sm font-semibold"
            >
              <ShieldIcon size={18} />
              <span>Security</span>
            </button>
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

          {/* Header */}
          <div className="w-full py-6 px-8 z-10 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-md border-b border-yellow-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/security')}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  <ArrowLeftIcon size={20} className="text-white" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <KeyIcon size={16} className="text-white" />
                </div>
                <h1 className="text-white text-xl font-semibold">Access Control Management</h1>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-20 p-8">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-white text-4xl font-bold mb-2">User Access Control</h1>
                <p className="text-white/70 text-lg">Manage user permissions and access levels</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users List */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <UsersIcon size={24} className="text-white" />
                    <h2 className="text-white text-2xl font-bold">All Users</h2>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-white/70">Loading users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <UsersIcon size={48} className="mx-auto text-white/30 mb-4" />
                      <p className="text-white/70">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            selectedUser?._id === user._id
                              ? 'bg-yellow-500/20 border-yellow-400/50'
                              : 'bg-white/5 border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-white font-bold text-lg">{user.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(user.role)}`}>
                                  <ShieldIcon size={12} className="inline mr-1" />
                                  {user.role === 'securityadmin' ? 'Security Admin' : user.role}
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
                            <KeyIcon size={20} className="text-yellow-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Permissions Panel */}
                <Card className="bg-white/10 border border-white/30 shadow-2xl rounded-2xl backdrop-blur-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <KeyIcon size={24} className="text-white" />
                    <h2 className="text-white text-2xl font-bold">Access Permissions</h2>
                  </div>

                  {loading && selectedUser ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/70 text-lg">Loading permissions...</p>
                    </div>
                  ) : !selectedUser ? (
                    <div className="text-center py-12">
                      <AlertCircleIcon size={48} className="mx-auto text-white/30 mb-4" />
                      <p className="text-white/70 text-lg">Select a user to manage their permissions</p>
                    </div>
                  ) : (
                    <div>
                      {/* Selected User Info */}
                      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{selectedUser.name}</h3>
                            <p className="text-white/70 text-sm">{selectedUser.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(selectedUser.role)}`}>
                          <ShieldIcon size={12} className="inline mr-1" />
                          {selectedUser.role === 'securityadmin' ? 'Security Admin' : selectedUser.role}
                        </span>
                      </div>

                      {/* Permissions List */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canViewCalendar)}
                            <span className="text-white">View Calendar</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canViewCalendar}
                              onChange={(e) => setPermissions({ ...permissions, canViewCalendar: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canCreateEvents)}
                            <span className="text-white">Create Events</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canCreateEvents}
                              onChange={(e) => setPermissions({ ...permissions, canCreateEvents: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canEditEvents)}
                            <span className="text-white">Edit Events</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canEditEvents}
                              onChange={(e) => setPermissions({ ...permissions, canEditEvents: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canDeleteEvents)}
                            <span className="text-white">Delete Events</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canDeleteEvents}
                              onChange={(e) => setPermissions({ ...permissions, canDeleteEvents: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canViewApplications)}
                            <span className="text-white">View Applications</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canViewApplications}
                              onChange={(e) => setPermissions({ ...permissions, canViewApplications: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canManageUsers)}
                            <span className="text-white">Manage Users</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canManageUsers}
                              onChange={(e) => setPermissions({ ...permissions, canManageUsers: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/20">
                          <div className="flex items-center gap-3">
                            {getPermissionIcon(permissions.canAccessSecurity)}
                            <span className="text-white">Access Security</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.canAccessSecurity}
                              onChange={(e) => setPermissions({ ...permissions, canAccessSecurity: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <XIcon size={18} />
                          Cancel
                        </button>
                        <button
                          onClick={handleSavePermissions}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-center gap-2"
                        >
                          <SaveIcon size={18} />
                          Save Permissions
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Info Section */}
              <div className="mt-8 p-6 rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl">
                <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
                  <KeyIcon size={24} className="text-yellow-400" />
                  About Access Control
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Use this interface to manage user permissions and access levels. Select a user from the list to view and modify their permissions. 
                  Changes are applied immediately and affect what features and areas of the system each user can access. 
                  Exercise caution when granting elevated permissions, especially for security and user management features.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-sm border border-yellow-400/30">
                    🔐 Granular Control
                  </span>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-200 text-sm border border-orange-400/30">
                    👥 User-Level Permissions
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-sm border border-red-400/30">
                    ⚡ Real-Time Updates
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

export default AccessControlPage;
