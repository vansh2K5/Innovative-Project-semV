// API utility functions for frontend

const API_BASE_URL = '/api';

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get headers with authentication
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Custom error class with additional context
export class APIError extends Error {
  status: number;
  serverMessage: string;
  details?: Record<string, string> | Array<{ field: string; message: string }>;
  isValidation: boolean;
  
  constructor(
    status: number, 
    serverMessage: string, 
    details?: Record<string, string> | Array<{ field: string; message: string }>
  ) {
    super(serverMessage);
    this.name = 'APIError';
    this.status = status;
    this.serverMessage = serverMessage;
    this.details = details;
    // 400 and 422 are validation error status codes
    this.isValidation = status === 400 || status === 422;
  }
}

// Handle API response with defensive parsing
const handleResponse = async (response: Response) => {
  let data: any;
  let serverMessage = 'An error occurred';
  
  // Attempt to parse response body
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Fallback to text for non-JSON responses (HTML error pages, etc.)
      const text = await response.text();
      data = { error: text || 'Empty response' };
    }
  } catch (parseError) {
    // JSON parse failed or body read failed
    console.error('Failed to parse response:', parseError);
    data = { error: 'Failed to parse server response' };
  }

  // Extract error message and validation details from various possible keys
  if (!response.ok) {
    let validationDetails: Record<string, string> | Array<{ field: string; message: string }> | undefined;
    
    // Extract main error message
    if (data.error) {
      serverMessage = data.error;
    } else if (data.message) {
      serverMessage = data.message;
    } else if (typeof data === 'string') {
      // If data is just a string, use it (truncate if too long)
      serverMessage = data.length > 200 ? data.substring(0, 200) + '...' : data;
    } else {
      serverMessage = `Request failed with status ${response.status}`;
    }
    
    // Extract validation details if present
    // Support two common shapes:
    // 1. Object map: { errors: { title: 'Title is required', startDate: 'Invalid date' } }
    // 2. Array: { errors: [{ field: 'title', message: 'Title is required' }] }
    // 3. Details array from Mongoose: { details: ['Title is required', 'Start date is required'] }
    if (data.errors) {
      if (Array.isArray(data.errors)) {
        // Array format: convert to object map for easier field lookup
        if (data.errors.length > 0 && typeof data.errors[0] === 'object' && 'field' in data.errors[0]) {
          // Array of { field, message } objects
          validationDetails = data.errors;
        } else {
          // Array of strings - convert to generic errors
          validationDetails = { _general: data.errors.join(', ') };
        }
      } else if (typeof data.errors === 'object') {
        // Object map format
        validationDetails = data.errors;
      }
    } else if (data.details && Array.isArray(data.details)) {
      // Mongoose validation details format
      validationDetails = { _general: data.details.join(', ') };
    }
    
    throw new APIError(response.status, serverMessage, validationDetails);
  }

  return data;
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
    position?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    department?: string;
    position?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  update: async (id: string, userData: {
    name?: string;
    department?: string;
    position?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Events API
export const eventsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    priority?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);

    const response = await fetch(`${API_BASE_URL}/events?${queryParams}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (eventData: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    type?: string;
    priority?: string;
    status?: string;
    assignedTo?: string[];
    location?: string;
    isAllDay?: boolean;
    recurrence?: any;
    reminders?: any[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  update: async (id: string, eventData: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    priority?: string;
    status?: string;
    assignedTo?: string[];
    location?: string;
    isAllDay?: boolean;
    recurrence?: any;
    reminders?: any[];
  }) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Analytics API
export const analyticsAPI = {
  get: async (params?: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/analytics?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  update: async (data: {
    date?: string;
    metrics?: {
      tasksCompleted?: number;
      tasksCreated?: number;
      eventsAttended?: number;
      hoursWorked?: number;
      productivityScore?: number;
    };
    activity?: {
      type: string;
      timestamp?: string;
      metadata?: any;
    };
  }) => {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getSummary: async (params?: {
    userId?: string;
    period?: 'week' | 'month' | 'year';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.period) queryParams.append('period', params.period);

    const response = await fetch(`${API_BASE_URL}/analytics/summary?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Export all APIs
export default {
  auth: authAPI,
  users: usersAPI,
  events: eventsAPI,
  analytics: analyticsAPI,
};
