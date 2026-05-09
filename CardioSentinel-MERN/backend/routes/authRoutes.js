const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getAllUsers, updateUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/users', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.patch('/users/:id', authMiddleware, roleMiddleware(['admin']), updateUser);

module.exports = router;
