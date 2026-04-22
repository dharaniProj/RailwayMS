const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer (store in memory so we can upload directly to Firebase)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', verifyToken, isAdmin, upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'health_card', maxCount: 1 },
    { name: 'other_documents', maxCount: 10 }
]), employeeController.registerEmployee);

router.get('/', verifyToken, isAdmin, employeeController.getAllEmployees);
router.get('/me', verifyToken, employeeController.getMe);
router.put('/admin/profile', verifyToken, isAdmin, employeeController.updateAdminProfile);
router.put('/:id/salary', verifyToken, isAdmin, employeeController.updateSalary);
router.delete('/:id', verifyToken, isAdmin, employeeController.deleteEmployee);
router.post('/:id/reset-password', verifyToken, isAdmin, employeeController.resetPassword);
router.post('/:id/profile-photo', verifyToken, upload.single('profile_photo'), employeeController.updateProfilePhoto);

module.exports = router;
