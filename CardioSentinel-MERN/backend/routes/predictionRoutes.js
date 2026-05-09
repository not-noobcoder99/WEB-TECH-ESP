const express = require('express');
const router = express.Router();
const { getPredictionHistory, manualPredict } = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/history/:patientId', getPredictionHistory);
router.post('/manual', manualPredict);

module.exports = router;
