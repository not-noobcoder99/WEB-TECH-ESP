const express = require('express');
const router = express.Router();
const { createTicket, getTickets, getTicket, updateTicket } = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public: submit a ticket (no auth needed)
router.post('/', createTicket);

// Protected routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'clinician']), getTickets);
router.get('/:id', authMiddleware, getTicket);
router.patch('/:id', authMiddleware, roleMiddleware(['admin', 'clinician']), updateTicket);

module.exports = router;
