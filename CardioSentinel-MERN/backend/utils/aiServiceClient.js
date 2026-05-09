// AI Service Client
// Makes calls to the Flask ML prediction service

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 15000,
});

/**
 * Call the Flask AI service for cardiac risk prediction
 * @param {Object} features - Clinical features for prediction
 * @returns {Promise<Object>} Prediction result with risk score, level, confidence
 */
const predictCardiacRisk = async (features) => {
  try {
    const response = await aiClient.post('/predict', features);
    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Return a safe default if service is unavailable
    return {
      riskScore: 0.5,
      riskLevel: 'moderate',
      prediction: 0,
      confidence: 0.0,
      error: 'AI service temporarily unavailable'
    };
  }
};

/**
 * Health check for AI service
 * @returns {Promise<Boolean>}
 */
const checkAIServiceHealth = async () => {
  try {
    const response = await aiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.warn('AI Service health check failed:', error.message);
    return false;
  }
};

module.exports = {
  predictCardiacRisk,
  checkAIServiceHealth,
  aiClient
};
