import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://tradvio-backend.ivanleejackson.workers.dev';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const currentPath = window.location.pathname;

    // Define public pages that don't require authentication
    const publicPages = ['/', '/signin', '/signup', '/pricing'];
    const isPublicPage = publicPages.includes(currentPath);

    // Handle 401 Unauthorized - redirect to login (only from protected pages)
    if (error.response?.status === 401 && !isPublicPage) {
      window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
    }

    // Handle 402 Payment Required - redirect to pricing
    if (error.response?.status === 402) {
      window.location.href = '/pricing?subscription_required=true';
    }

    // Handle 429 Rate Limit - show friendly message
    if (error.response?.status === 429) {
      // TODO: Show toast notification
      console.error('Rate limit exceeded. Please try again in a few moments.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
