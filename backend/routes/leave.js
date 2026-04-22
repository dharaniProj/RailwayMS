const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/me', verifyToken, leaveController.getMyLeaves);
router.get('/requests', verifyToken, isAdmin, leaveController.getLeaveRequests);
router.put('/:id/status', verifyToken, isAdmin, leaveController.updateLeaveStatus);
router.get('/employee/:employeeId', verifyToken, leaveController.getEmployeeLeaveDetails);
router.put('/employee/:employeeId/count', verifyToken, isAdmin, leaveController.updateLeaveCount);
router.put('/:id', verifyToken, isAdmin, leaveController.updateLeave);
router.post('/manual-add', verifyToken, isAdmin, leaveController.addManualLeave);
router.delete('/:id', verifyToken, isAdmin, leaveController.deleteLeave);

module.exports = router;
