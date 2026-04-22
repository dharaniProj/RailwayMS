const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
