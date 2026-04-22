const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

// Admin Routes
router.post('/', authMiddleware(['admin']), upload.fields([{ name: 'documents', maxCount: 5 }]), meetingController.createMeeting);
router.get('/admin', authMiddleware(['admin']), meetingController.getAllMeetings);
router.put('/:meeting_id/mom', authMiddleware(['admin']), upload.single('mom'), meetingController.uploadMoM);

// Employee Routes
router.get('/employee', authMiddleware(['employee', 'admin']), meetingController.getEmployeeMeetings);
router.put('/:meeting_id/confirm', authMiddleware(['employee', 'admin']), meetingController.confirmAttendance);

module.exports = router;
