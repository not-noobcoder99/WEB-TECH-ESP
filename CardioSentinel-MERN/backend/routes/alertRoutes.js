const express = require('express');
const router = express.Router();
const { getAlerts, getAlert, updateAlert, createAlert, getAlertStats } = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/stats', getAlertStats);
router.get('/', getAlerts);
router.post('/', createAlert);
router.get('/:id', getAlert);
router.patch('/:id', updateAlert);

module.exports = router;
