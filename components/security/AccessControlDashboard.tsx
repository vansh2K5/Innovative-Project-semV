'use client';

import React from 'react';
import { KeyIcon, X } from 'lucide-react';

interface AccessRole {
  id: string;
  name: string;
  permissions: string[];
  users: number;
}

export default function AccessControlDashboard({ onClose }: { onClose: () => void }) {
  const roles: AccessRole[] = [
    {
      id: '1',
      name: 'Admin',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_security'],
      users: 1,
    },
    {
      id: '2',
      name: 'Security Admin',
      permissions: ['read', 'write', 'manage_security', 'view_logs'],
      users: 0,
    },
    {
      id: '3',
      name: 'User',
      permissions: ['read', 'write'],
      users: 5,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-blue-500/50 rounded-2xl w-full max-w-4xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
          <div className="flex items-center gap-3">
            <KeyIcon className="text-blue-500" size={24} />
            <h2 className="text-white text-xl font-bold">Access Control</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{role.name}</h3>
                  <span className="px-3 py-1 bg-blue-600/30 text-blue-200 text-sm rounded">
                    {role.users} user{role.users !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span key={perm} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Role
          </button>
        </div>
      </div>
    </div>
  );
}
