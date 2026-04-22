const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salary');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, salaryController.getMySalaryHistory);
router.get('/:employeeId', verifyToken, isAdmin, salaryController.getEmployeeSalaryHistory);
router.post('/:employeeId', verifyToken, isAdmin, salaryController.generateSalary);

module.exports = router;
