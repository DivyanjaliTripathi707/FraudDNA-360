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
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me')
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary')
};

export const detectionService = {
  analyzeTransaction: (payload) => api.post('/detection/analyze', payload),
  getSuspicious: () => api.get('/detection/suspicious'),
  evaluateMuleRisk: (payload) => api.post('/intelligence/mule/evaluate', payload),
  getMuleSuspects: () => api.get('/intelligence/mule/suspects')
};

export const threatIntelService = {
  analyzeUrl: (payload) => api.post('/intelligence/threat/url', payload),
  analyzeScamText: (payload) => api.post('/intelligence/threat/scam-text', payload),
  analyzeVoiceDemo: (payload) => api.post('/intelligence/threat/voice-demo', payload),
  sendFamilyAlert: (payload) => api.post('/intelligence/family-alert', payload)
};

export const networkService = {
  getFullGraph: () => api.get('/network/graph'),
  getAccountNetwork: (id) => api.get(`/network/account/${id}`),
  traceNetwork: (id, depth = 3) => api.get(`/network/trace/${id}?depth=${depth}`),
  getMoneyFlow: (sourceId = 1001) => api.get(`/intelligence/money-flow?source=${sourceId}`),
  getNetworkImpact: (entityId = 1002) => api.get(`/intelligence/network-impact?entity=${entityId}`),
  extractEntities: (payload) => api.post('/intelligence/entity-extract', payload),
  resolveEntities: (payload) => api.post('/intelligence/entity-resolve', payload),
  getEntityLinks: () => api.get('/intelligence/entity-links')
};

export const predictionService = {
  predict: (params) => api.post('/prediction/predict', params),
  getHotspots: () => api.get('/prediction/hotspots'),
  getCampaigns: () => api.get('/intelligence/campaigns')
};

export const riskService = {
  getRisk: (id, type = 'LOCATION') => api.get(`/risk/${id}?type=${type}`),
  recalculateRisk: (payload) => api.post('/risk/recalculate', payload),
  calculateRiskFusion: (payload) => api.post('/intelligence/risk-fusion/calculate', payload),
  getRiskWeights: () => api.get('/intelligence/risk-fusion/weights'),
  updateRiskWeights: (payload) => api.put('/intelligence/risk-fusion/weights', payload)
};

export const responseService = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (payload) => api.post('/alerts', payload),
  getLead: (id) => api.get(`/alerts/lead/${id}`),
  getInvestigations: () => api.get('/investigations'),
  createInvestigation: (payload) => api.post('/investigations', payload),
  updateInvestigation: (id, payload) => api.put(`/investigations/${id}`, payload),
  triggerAutopilot: (payload) => api.post('/intelligence/autopilot/trigger', payload),
  getEvidencePackages: () => api.get('/intelligence/evidence'),
  getEvidencePackageByRef: (ref) => api.get(`/intelligence/evidence/${ref}`),
  addCustodyLog: (ref, payload) => api.post(`/intelligence/evidence/${ref}/custody`, payload),
  unifiedSearch: (query) => api.get(`/intelligence/search?q=${encodeURIComponent(query)}`)
};

export const recoveryService = {
  getAllCases: () => api.get('/recovery'),
  getCaseByRef: (ref) => api.get(`/recovery/${ref}`),
  verifyTransaction: (payload) => api.post('/recovery/verify', payload),
  updateStatus: (ref, payload) => api.put(`/recovery/${ref}/status`, payload)
};

export const dataService = {
  getTransactions: (suspicious) => api.get(`/transactions${suspicious ? '?suspicious=true' : ''}`),
  createTransaction: (data) => api.post('/transactions', data)
};

export default api;
