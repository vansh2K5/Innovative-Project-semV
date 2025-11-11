"use client";
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate date logic
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        setError('End date must be after start date');
        return;
      }

      // Combine date and time
      const startDateTime = formData.isAllDay 
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime || '00:00'}`).toISOString();
      
      const endDateTime = formData.isAllDay
        ? new Date(formData.endDate).toISOString()
        : new Date(`${formData.endDate}T${formData.endTime || '23:59'}`).toISOString();

      // Create event
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
      };

      await api.events.create(eventData);

      setSuccess('Event created successfully!');
      
      // Reset form
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
      });

      // Notify parent and close after delay
      setTimeout(() => {
        onEventCreated();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error creating event:', err);
      
      // Handle APIError with status codes and validation details
      if (err.name === 'APIError') {
        // Handle validation errors with field-level details
        if (err.isValidation && err.details) {
          // Convert details to field error map
          const errors: Record<string, string> = {};
          
          if (Array.isArray(err.details)) {
            // Array format: [{ field: 'title', message: 'Required' }]
            err.details.forEach((detail: any) => {
              if (detail.field && detail.message) {
                errors[detail.field] = detail.message;
              }
            });
          } else if (typeof err.details === 'object') {
            // Object map format: { title: 'Required', startDate: 'Invalid' }
            Object.assign(errors, err.details);
          }
          
          setFieldErrors(errors);
          
          // Set general error message
          if (errors._general) {
            setError(errors._general);
          } else {
            setError(`Validation failed: ${err.serverMessage}`);
          }
        } else {
          // Non-validation API errors - show exact server message
          setError(`Server error: ${err.serverMessage}`);
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Always clear loading state
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
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error/Success Messages */}
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

          {/* Title */}
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

          {/* Description */}
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

          {/* Type and Priority */}
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

          {/* All Day Checkbox */}
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

          {/* Start Date and Time */}
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

          {/* End Date and Time */}
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

          {/* Location */}
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

          {/* Buttons */}
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
