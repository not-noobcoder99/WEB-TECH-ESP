const express = require('express');
const router = express.Router();
const { getPatients, getPatient, createPatient, updatePatient, deletePatient, getNotes, addNote, deleteNote } = require('../controllers/patientController');
const { getPatientTelemetry, getLatestTelemetry } = require('../controllers/telemetryController');
const { getPatientAlerts } = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', getPatients);
router.post('/', roleMiddleware(['clinician', 'admin']), createPatient);
router.get('/:id', getPatient);
router.put('/:id', roleMiddleware(['clinician', 'admin']), updatePatient);
router.patch('/:id', roleMiddleware(['clinician', 'admin']), updatePatient);
router.delete('/:id', roleMiddleware(['admin']), deletePatient);

// Clinical notes
router.get('/:id/notes', getNotes);
router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

// Nested patient resources
router.get('/:patientId/telemetry', getPatientTelemetry);
router.get('/:patientId/telemetry/latest', getLatestTelemetry);
router.get('/:patientId/alerts', getPatientAlerts);

module.exports = router;
