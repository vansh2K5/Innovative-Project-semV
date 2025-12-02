"use client";
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, AlertCircle, ChevronDown, Check } from 'lucide-react';
import api from '@/lib/api';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

interface RoleOption {
  id: string;
  name: string;
  displayName: string;
}

const DEFAULT_ROLES: RoleOption[] = [
  { id: 'admin', name: 'admin', displayName: 'Administrator' },
  { id: 'securityadmin', name: 'securityadmin', displayName: 'Security Admin' },
  { id: 'user', name: 'user', displayName: 'Standard User' },
];

export default function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    type: 'meeting',
    priority: 'medium',
    location: '',
    isAllDay: false,
    visibleToAll: true,
    targetRoles: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<RoleOption[]>(DEFAULT_ROLES);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      checkUserRole();
    }
  }, [isOpen]);

  const checkUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'admin' || user.role === 'securityadmin');
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.roles && data.roles.length > 0) {
          setRoles(data.roles.map((r: any) => ({
            id: r.name,
            name: r.name,
            displayName: r.displayName,
          })));
        }
      }
    } catch (error) {
      console.log('Using default roles');
    }
  };

  if (!isOpen) return null;

  const handleRoleToggle = (roleName: string) => {
    setFormData(prev => {
      const newRoles = prev.targetRoles.includes(roleName)
        ? prev.targetRoles.filter(r => r !== roleName)
        : [...prev.targetRoles, roleName];
      return { ...prev, targetRoles: newRoles };
    });
  };

  const handleVisibilityChange = (visibleToAll: boolean) => {
    setFormData(prev => ({
      ...prev,
      visibleToAll,
      targetRoles: visibleToAll ? [] : prev.targetRoles,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (!formData.title || !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields');
        return;
      }

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(formData.startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      
      if (startDateOnly < today) {
        setError('Event start date cannot be before today');
        return;
      }
      
      if (end < start) {
        setError('End date must be after start date');
        return;
      }

      if (!formData.visibleToAll && formData.targetRoles.length === 0) {
        setError('Please select at least one role or make the event visible to all');
        return;
      }

      const startDateTime = formData.isAllDay 
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime || '00:00'}`).toISOString();
      
      const endDateTime = formData.isAllDay
        ? new Date(formData.endDate).toISOString()
        : new Date(`${formData.endDate}T${formData.endTime || '23:59'}`).toISOString();

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime,
        endDate: endDateTime,
        type: formData.type,
        priority: formData.priority,
        location: formData.location,
        isAllDay: formData.isAllDay,
        status: 'pending',
        visibleToAll: formData.visibleToAll,
        targetRoles: formData.visibleToAll ? [] : formData.targetRoles,
      };

      await api.events.create(eventData);

      setSuccess('Event created successfully!');
      
      setFormData({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        type: 'meeting',
        priority: 'medium',
        location: '',
        isAllDay: false,
        visibleToAll: true,
        targetRoles: [],
      });

      setTimeout(() => {
        onEventCreated();
        onClose();
      }, 1000);
    } catch (err: any) {
      if (err.name === 'APIError') {
        if (err.status === 403) {
          setError('Permission Denied: You do not have permission to create events. Please contact your administrator.');
        }
        else if (err.isValidation && err.details) {
          console.error('Validation error creating event:', err);
          const errors: Record<string, string> = {};
          
          if (Array.isArray(err.details)) {
            err.details.forEach((detail: any) => {
              if (detail.field && detail.message) {
                errors[detail.field] = detail.message;
              }
            });
          } else if (typeof err.details === 'object') {
            Object.assign(errors, err.details);
          }
          
          setFieldErrors(errors);
          
          if (errors._general) {
            setError(errors._general);
          } else {
            setError(`Validation failed: ${err.serverMessage}`);
          }
        } else {
          console.error('API error creating event:', err);
          setError(`Error: ${err.serverMessage}`);
        }
      } else if (err.message) {
        console.error('Error creating event:', err);
        setError(err.message);
      } else {
        console.error('Unexpected error creating event:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20 backdrop-blur-xl">
        <div className="sticky top-0 bg-black/30 backdrop-blur-md border-b border-white/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-purple-400" />
            Create New Event
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder:text-white/50 focus:outline-none focus:ring-2 ${
                fieldErrors.title 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/30 focus:ring-purple-500'
              }`}
              placeholder="Enter event title"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Enter event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Event Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="meeting" className="bg-purple-900">Meeting</option>
                <option value="task" className="bg-purple-900">Task</option>
                <option value="reminder" className="bg-purple-900">Reminder</option>
                <option value="deadline" className="bg-purple-900">Deadline</option>
                <option value="other" className="bg-purple-900">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low" className="bg-purple-900">Low</option>
                <option value="medium" className="bg-purple-900">Medium</option>
                <option value="high" className="bg-purple-900">High</option>
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/20">
              <label className="block text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <Users size={16} />
                Event Visibility
              </label>
              
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.visibleToAll}
                    onChange={() => handleVisibilityChange(true)}
                    className="w-4 h-4 text-purple-500"
                  />
                  <span className="text-white text-sm">Visible to All Roles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.visibleToAll}
                    onChange={() => handleVisibilityChange(false)}
                    className="w-4 h-4 text-purple-500"
                  />
                  <span className="text-white text-sm">Specific Roles Only</span>
                </label>
              </div>

              {!formData.visibleToAll && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between"
                  >
                    <span>
                      {formData.targetRoles.length === 0 
                        ? 'Select roles...' 
                        : `${formData.targetRoles.length} role(s) selected`}
                    </span>
                    <ChevronDown size={18} className={`transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-purple-900 border border-white/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleRoleToggle(role.name)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center justify-between"
                        >
                          <span>{role.displayName}</span>
                          {formData.targetRoles.includes(role.name) && (
                            <Check size={16} className="text-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {formData.targetRoles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.targetRoles.map(roleName => {
                        const role = roles.find(r => r.name === roleName);
                        return (
                          <span
                            key={roleName}
                            className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full flex items-center gap-1"
                          >
                            {role?.displayName || roleName}
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(roleName)}
                              className="hover:text-red-300"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isAllDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="w-4 h-4 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-500"
            />
            <label className="text-white text-sm">All Day Event</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white focus:outline-none focus:ring-2 ${
                  fieldErrors.startDate 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-white/30 focus:ring-purple-500'
                }`}
              />
              {fieldErrors.startDate && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {fieldErrors.startDate}
                </p>
              )}
            </div>
            {!formData.isAllDay && (
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                End Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {!formData.isAllDay && (
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter location (optional)"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
