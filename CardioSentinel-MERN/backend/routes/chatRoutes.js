const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const chatLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages. Please wait before sending more.' },
});

router.use(authMiddleware);
router.post('/', chatLimiter, sendMessage);

module.exports = router;
