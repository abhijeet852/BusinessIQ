import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== '') {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  return isLocal ? 'http://127.0.0.1:8000/api' : 'https://businessiq.onrender.com/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Interceptor to inject JWT Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('datapulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getAuthMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getFilterOptions = async () => {
  const res = await api.get('/filters');
  return res.data;
};

export const getDashboardData = async (filters = {}) => {
  const res = await api.get('/dashboard', { params: filters });
  return res.data;
};

export const getBusinessHealth = async (filters = {}) => {
  const res = await api.get('/business-health', { params: filters });
  return res.data;
};

export const getBusinessAlerts = async (filters = {}) => {
  const res = await api.get('/business-alerts', { params: filters });
  return res.data;
};

export const getProfitabilityMatrix = async (filters = {}) => {
  const res = await api.get('/profitability-matrix', { params: filters });
  return res.data;
};

export const getSalesData = async (filters = {}, page = 1, limit = 15) => {
  const res = await api.get('/sales', { params: { ...filters, page, limit } });
  return res.data;
};

export const getCustomersData = async (filters = {}) => {
  const res = await api.get('/customers', { params: filters });
  return res.data;
};

export const getCustomer360 = async (customerId) => {
  const res = await api.get(`/customer-360/${customerId}`);
  return res.data;
};

export const getProductsData = async (filters = {}) => {
  const res = await api.get('/products', { params: filters });
  return res.data;
};

export const getRegionsData = async (filters = {}) => {
  const res = await api.get('/regions', { params: filters });
  return res.data;
};

export const getPipelineStatus = async () => {
  const res = await api.get('/etl/pipeline-status');
  return res.data;
};

export const getDataLineage = async (filename = 'sales.csv') => {
  const res = await api.get('/etl/lineage', { params: { filename } });
  return res.data;
};

export const uploadEtlRun = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/etl/upload-run', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getSegmentationML = async (nClusters = 3, filters = {}) => {
  const res = await api.get('/ml/segmentation', { params: { n_clusters: nClusters, ...filters } });
  return res.data;
};

export const getChurnPredictionML = async (recencyThreshold = 90, filters = {}) => {
  const res = await api.get('/ml/churn', { params: { recency_threshold: recencyThreshold, ...filters } });
  return res.data;
};

export const getChurnModelComparison = async (recencyThreshold = 90) => {
  const res = await api.get('/ml/churn-comparison', { params: { recency_threshold: recencyThreshold } });
  return res.data;
};

export const getSalesForecastML = async (horizon = 3, filters = {}) => {
  const res = await api.get('/ml/forecast', { params: { horizon, ...filters } });
  return res.data;
};

export const uploadDatasetFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getReportDownloadUrl = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return `${API_BASE_URL}/reports/export?${params.toString()}`;
};

export default api;
