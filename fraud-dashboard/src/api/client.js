import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fraudDashboardToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fraudDashboardToken');
      localStorage.removeItem('fraudDashboardUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email, password, name) => {
    const response = await apiClient.post('/auth/register', { email, password, name });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const transactionsApi = {
  list: async () => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },

  create: async (amount, merchant, countryCode) => {
    const response = await apiClient.post('/transactions', { amount, merchant, countryCode });
    return response.data;
  },

  getAuditLogs: async (transactionId) => {
    const response = await apiClient.get(`/transactions/${transactionId}/audit`);
    return response.data;
  },
};

export default apiClient;
