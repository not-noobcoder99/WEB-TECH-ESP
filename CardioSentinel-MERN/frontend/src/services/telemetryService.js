// Telemetry Service
// API calls for vital signs data

import apiClient from './apiClient';

const telemetryService = {
  // Get all telemetry readings
  getAllTelemetry: async (page = 1, limit = 20, filters = {}) => {
    const response = await apiClient.get('/api/telemetry', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  // Get telemetry for specific patient
  getPatientTelemetry: async (patientId, limit = 50) => {
    const response = await apiClient.get(`/api/patients/${patientId}/telemetry`, {
      params: { limit }
    });
    return response.data;
  },

  // Record new telemetry reading (triggers AI prediction)
  recordReading: async (patientId, vitals) => {
    const response = await apiClient.post('/api/telemetry', {
      patientId,
      ...vitals
    });
    return response.data;
  },

  // Get telemetry statistics
  getTelemetryStats: async (patientId) => {
    const response = await apiClient.get(`/api/telemetry/stats/${patientId}`);
    return response.data;
  }
};

export default telemetryService;
