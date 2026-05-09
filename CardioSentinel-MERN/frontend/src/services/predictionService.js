// Prediction Service
// API calls for AI predictions and ML model data

import apiClient from './apiClient';

const predictionService = {
  // Run new prediction
  predict: async (features) => {
    const response = await apiClient.post('/api/predictions/predict', features);
    return response.data;
  },

  // Get prediction history for patient
  getPredictionHistory: async (patientId, limit = 50) => {
    const response = await apiClient.get(
      `/api/predictions/history/${patientId}`,
      { params: { limit } }
    );
    return response.data;
  }
};

export default predictionService;
