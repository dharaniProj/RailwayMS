const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, isAdmin, announcementController.createAnnouncement);
router.put('/:id', verifyToken, isAdmin, announcementController.updateAnnouncement);
router.delete('/:id', verifyToken, isAdmin, announcementController.deleteAnnouncement);
router.get('/', verifyToken, announcementController.getAnnouncements);
router.post('/:id/read', verifyToken, announcementController.markAsRead);

module.exports = router;
