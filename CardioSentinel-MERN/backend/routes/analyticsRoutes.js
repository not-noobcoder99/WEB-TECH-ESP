const express = require('express');
const router = express.Router();
const { getDashboardStats, getRiskDistribution, getAlertTrends, getTelemetryAverages, getRecentTelemetryTrend } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/risk-distribution', getRiskDistribution);
router.get('/alert-trends', getAlertTrends);
router.get('/telemetry-averages/:patientId', getTelemetryAverages);
router.get('/recent-telemetry/:patientId', getRecentTelemetryTrend);

module.exports = router;
