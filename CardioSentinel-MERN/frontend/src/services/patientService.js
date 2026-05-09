// Patient Service
// API calls for patient management

import apiClient from './apiClient';

const patientService = {
  // Get all patients (paginated)
  getAllPatients: async (page = 1, limit = 10, filters = {}) => {
    const response = await apiClient.get('/api/patients', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  // Get single patient
  getPatient: async (id) => {
    const response = await apiClient.get(`/api/patients/${id}`);
    return response.data;
  },

  // Create new patient
  createPatient: async (patientData) => {
    const response = await apiClient.post('/api/patients', patientData);
    return response.data;
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    const response = await apiClient.put(`/api/patients/${id}`, patientData);
    return response.data;
  },

  // Delete patient (admin only)
  deletePatient: async (id) => {
    const response = await apiClient.delete(`/api/patients/${id}`);
    return response.data;
  },

  // Search patients
  searchPatients: async (query) => {
    const response = await apiClient.get('/api/patients/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Get patient alerts
  getPatientAlerts: async (id) => {
    const response = await apiClient.get(`/api/patients/${id}/alerts`);
    return response.data;
  },

  // Get patient telemetry
  getPatientTelemetry: async (id) => {
    const response = await apiClient.get(`/api/patients/${id}/telemetry`);
    return response.data;
  }
};

export default patientService;
