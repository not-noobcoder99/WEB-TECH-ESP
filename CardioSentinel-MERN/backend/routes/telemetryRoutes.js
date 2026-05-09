const express = require('express');
const router = express.Router();
const { createTelemetry, getTelemetryById } = require('../controllers/telemetryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', createTelemetry);
router.get('/:id', getTelemetryById);

module.exports = router;
