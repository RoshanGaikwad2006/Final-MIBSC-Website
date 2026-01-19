import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // headers: { 'Content-Type': 'application/json' } // Removing this to allow axios to set it automatically (especially for FormData)
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Don't redirect here - let AuthContext handle it
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  me: '/auth/me',
  changePassword: '/auth/change-password',

  // Events
  events: '/events',
  eventById: (id) => `/events/${id}`,
  eventRegisterClick: (id) => `/events/${id}/register-click`,

  // Achievements
  achievements: '/achievements',
  achievementById: (id) => `/achievements/${id}`,

  // Projects
  projects: '/projects',
  projectById: (id) => `/projects/${id}`,

  // Members
  members: '/members',
  memberById: (id) => `/members/${id}`,

  // Sponsors
  sponsors: '/sponsors',
  sponsorById: (id) => `/sponsors/${id}`,

  // Contact
  contact: '/contact',
  contactRespond: (id) => `/contact/${id}/respond`,

  // Analytics
  analyticsDashboard: '/analytics/dashboard',
  analyticsEvents: '/analytics/events',
};

export default api;