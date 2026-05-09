// Analytics Service
// API calls for dashboard and analytics data

import apiClient from './apiClient';

const analyticsService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data;
  },

  // Get risk distribution
  getRiskDistribution: async () => {
    const response = await apiClient.get('/api/analytics/risk-distribution');
    return response.data;
  },

  // Get alert trends
  getAlertTrends: async (days = 30) => {
    const response = await apiClient.get('/api/analytics/alert-trends', {
      params: { days }
    });
    return response.data;
  },

  // Get average telemetry metrics
  getAverageTelemetry: async () => {
    const response = await apiClient.get('/api/analytics/telemetry-avg');
    return response.data;
  }
};

export default analyticsService;
