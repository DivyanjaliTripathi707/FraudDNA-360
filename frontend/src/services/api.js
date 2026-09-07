import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to append JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('frauddna_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for clean error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Server network communication failure';
    console.error('[API ERROR]', message);
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary')
};

export const detectionService = {
  analyzeTransaction: (payload) => api.post('/detection/analyze', payload),
  getSuspicious: () => api.get('/detection/suspicious')
};

export const networkService = {
  getFullGraph: () => api.get('/network/graph'),
  getAccountNetwork: (id) => api.get(`/network/account/${id}`),
  traceNetwork: (id, depth = 3) => api.get(`/network/trace/${id}?depth=${depth}`)
};

export const predictionService = {
  predict: (params) => api.post('/prediction/predict', params),
  getHotspots: () => api.get('/prediction/hotspots')
};

export const riskService = {
  getRisk: (id, type = 'LOCATION') => api.get(`/risk/${id}?type=${type}`),
  recalculateRisk: (payload) => api.post('/risk/recalculate', payload)
};

export const responseService = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (payload) => api.post('/alerts', payload),
  getLead: (id) => api.get(`/alerts/lead/${id}`),
  getInvestigations: () => api.get('/investigations'),
  createInvestigation: (payload) => api.post('/investigations', payload),
  updateInvestigation: (id, payload) => api.put(`/investigations/${id}`, payload)
};

export const dataService = {
  getTransactions: (suspicious) => api.get(`/transactions${suspicious ? '?suspicious=true' : ''}`),
  createTransaction: (data) => api.post('/transactions', data)
};

export default api;
