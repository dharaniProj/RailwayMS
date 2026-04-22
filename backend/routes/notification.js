const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:id/read', verifyToken, notificationController.markRead);
router.put('/read-all', verifyToken, notificationController.markAllRead);

module.exports = router;
