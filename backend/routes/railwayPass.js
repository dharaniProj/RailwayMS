const express = require('express');
const router = express.Router();
const railwayPassController = require('../controllers/railwayPass');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/apply', verifyToken, railwayPassController.applyPass);
router.get('/my', verifyToken, railwayPassController.getMyApplications);
router.get('/admin/all', verifyToken, isAdmin, railwayPassController.getAllApplications);
router.put('/admin/:id/status', verifyToken, isAdmin, railwayPassController.updatePassStatus);

module.exports = router;
