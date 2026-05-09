const express = require('express');
const router = express.Router();
const { getMyProfile, submitReading, getMyHistory, getMyAlerts } = require('../controllers/patientPortalController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['patient']));

router.get('/me',       getMyProfile);
router.post('/reading', submitReading);
router.get('/history',  getMyHistory);
router.get('/alerts',   getMyAlerts);

module.exports = router;
