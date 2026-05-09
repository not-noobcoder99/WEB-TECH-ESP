// Alert Service
// API calls for alert management

import apiClient from './apiClient';

const alertService = {
  // Get all alerts (filterable)
  getAllAlerts: async (filters = {}) => {
    const response = await apiClient.get('/api/alerts', {
      params: filters
    });
    return response.data;
  },

  // Get single alert
  getAlert: async (id) => {
    const response = await apiClient.get(`/api/alerts/${id}`);
    return response.data;
  },

  // Create alert manually
  createAlert: async (alertData) => {
    const response = await apiClient.post('/api/alerts', alertData);
    return response.data;
  },

  // Update alert (mark reviewed, resolved, etc.)
  updateAlert: async (id, updateData) => {
    const response = await apiClient.put(`/api/alerts/${id}`, updateData);
    return response.data;
  },

  // Get alert statistics
  getAlertStats: async () => {
    const response = await apiClient.get('/api/alerts/stats');
    return response.data;
  }
};

export default alertService;
