import axios from 'axios';

// Default to live Render backend URL, or fallback to environment variable / localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://businessiq.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getSalesData = async (filters = {}, page = 1, limit = 15) => {
  const res = await api.get('/sales', { params: { ...filters, page, limit } });
  return res.data;
};

export const getCustomersData = async (filters = {}) => {
  const res = await api.get('/customers', { params: filters });
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

export const getSegmentationML = async (nClusters = 3, filters = {}) => {
  const res = await api.get('/ml/segmentation', { params: { n_clusters: nClusters, ...filters } });
  return res.data;
};

export const getChurnPredictionML = async (recencyThreshold = 90, filters = {}) => {
  const res = await api.get('/ml/churn', { params: { recency_threshold: recencyThreshold, ...filters } });
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
