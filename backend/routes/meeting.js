const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

// Admin Routes
router.post('/', verifyToken, isAdmin, upload.fields([{ name: 'documents', maxCount: 5 }]), meetingController.createMeeting);
router.get('/admin', verifyToken, isAdmin, meetingController.getAllMeetings);
router.put('/:meeting_id/mom', verifyToken, isAdmin, upload.single('mom'), meetingController.uploadMoM);

// Employee Routes (Both Admin and Employees can access these)
router.get('/employee', verifyToken, meetingController.getEmployeeMeetings);
router.put('/:meeting_id/confirm', verifyToken, meetingController.confirmAttendance);

module.exports = router;
