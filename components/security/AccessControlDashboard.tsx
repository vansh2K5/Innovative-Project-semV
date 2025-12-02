'use client';

import React, { useState, useEffect } from 'react';
import { KeyIcon, X, Plus, Edit2, Trash2, Save, Shield, Check } from 'lucide-react';

interface RolePermissions {
  canViewCalendar: boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewApplications: boolean;
  canManageUsers: boolean;
  canAccessSecurity: boolean;
  canViewReports: boolean;
  canExportData: boolean;
}

interface AccessRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: RolePermissions;
  isSystemRole: boolean;
  isActive: boolean;
}

const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  canViewCalendar: 'View Calendar',
  canCreateEvents: 'Create Events',
  canEditEvents: 'Edit Events',
  canDeleteEvents: 'Delete Events',
  canViewApplications: 'View Applications',
  canManageUsers: 'Manage Users',
  canAccessSecurity: 'Access Security',
  canViewReports: 'View Reports',
  canExportData: 'Export Data',
};

const DEFAULT_PERMISSIONS: RolePermissions = {
  canViewCalendar: true,
  canCreateEvents: false,
  canEditEvents: false,
  canDeleteEvents: false,
  canViewApplications: true,
  canManageUsers: false,
  canAccessSecurity: false,
  canViewReports: false,
  canExportData: false,
};

export default function AccessControlDashboard({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<AccessRole | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: { ...DEFAULT_PERMISSIONS },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchRoles();
    }
  }, [mounted]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    setError('');
    setSuccess('');

    if (!createForm.name || !createForm.displayName) {
      setError('Name and display name are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create role');
        return;
      }

      setSuccess('Role created successfully!');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        displayName: '',
        description: '',
        permissions: { ...DEFAULT_PERMISSIONS },
      });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      setError('Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: editingRole._id,
          displayName: editingRole.displayName,
          description: editingRole.description,
          permissions: editingRole.permissions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update role');
        return;
      }

      setSuccess('Role updated successfully!');
      setEditingRole(null);
      fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/roles?roleId=${roleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess('Role deleted successfully');
        fetchRoles();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role');
    }
  };

  const togglePermission = (permission: keyof RolePermissions, isCreate: boolean = false) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: !prev.permissions[permission],
        },
      }));
    } else if (editingRole) {
      setEditingRole({
        ...editingRole,
        permissions: {
          ...editingRole.permissions,
          [permission]: !editingRole.permissions[permission],
        },
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-blue-500/50 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
          <div className="flex items-center gap-3">
            <KeyIcon className="text-blue-500" size={24} />
            <h2 className="text-white text-xl font-bold">Access Control & Role Management</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {(error || success) && (
          <div className={`mx-6 mt-4 p-3 rounded-lg ${error ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
            <p className={error ? 'text-red-200 text-sm' : 'text-green-200 text-sm'}>{error || success}</p>
          </div>
        )}

        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="text-white/70 text-sm">
            Manage system roles and their permissions. System roles cannot be modified.
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Custom Role
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading roles...</div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className={`rounded-xl p-5 border ${
                    role.isSystemRole 
                      ? 'bg-gray-800/50 border-gray-700' 
                      : 'bg-blue-900/20 border-blue-500/30'
                  }`}
                >
                  {editingRole && editingRole._id === role._id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="text-blue-400" size={20} />
                          <input
                            type="text"
                            value={editingRole.displayName}
                            onChange={(e) => setEditingRole({ ...editingRole, displayName: e.target.value })}
                            className="bg-white/10 border border-white/30 rounded px-3 py-1 text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingRole(null)}
                            className="px-3 py-1 text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateRole}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Save size={16} /> Save
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={editingRole.description || ''}
                        onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                        placeholder="Role description..."
                        className="w-full bg-white/10 border border-white/30 rounded px-3 py-2 text-white text-sm resize-none"
                        rows={2}
                      />

                      <div>
                        <div className="text-white/70 text-sm mb-2">Permissions:</div>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.keys(PERMISSION_LABELS) as (keyof RolePermissions)[]).map((perm) => (
                            <button
                              key={perm}
                              onClick={() => togglePermission(perm)}
                              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                                editingRole.permissions[perm]
                                  ? 'bg-green-500/30 text-green-200 border border-green-500/50'
                                  : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                              }`}
                            >
                              {editingRole.permissions[perm] && <Check size={14} />}
                              {PERMISSION_LABELS[perm]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Shield className={role.isSystemRole ? 'text-yellow-400' : 'text-blue-400'} size={20} />
                          <div>
                            <h3 className="text-white font-semibold flex items-center gap-2">
                              {role.displayName}
                              {role.isSystemRole && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-200 text-xs rounded">
                                  System
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-400 text-sm">{role.description || `Role: ${role.name}`}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!role.isSystemRole && (
                            <>
                              <button
                                onClick={() => setEditingRole(role)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role._id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(role.permissions) as (keyof RolePermissions)[])
                          .filter(perm => role.permissions[perm])
                          .map((perm) => (
                            <span
                              key={perm}
                              className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded"
                            >
                              {PERMISSION_LABELS[perm]}
                            </span>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
          <div className="bg-slate-800 border border-blue-500/50 rounded-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <Plus className="text-blue-400" size={20} />
                Create Custom Role
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Role Name (ID)</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., manager"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Display Name</label>
                  <input
                    type="text"
                    value={createForm.displayName}
                    onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                    placeholder="e.g., Project Manager"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Brief description of this role..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Permissions</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(PERMISSION_LABELS) as (keyof RolePermissions)[]).map((perm) => (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => togglePermission(perm, true)}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                        createForm.permissions[perm]
                          ? 'bg-green-500/30 text-green-200 border border-green-500/50'
                          : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                      }`}
                    >
                      {createForm.permissions[perm] && <Check size={14} />}
                      {PERMISSION_LABELS[perm]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
