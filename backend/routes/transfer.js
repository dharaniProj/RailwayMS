const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/request', verifyToken, transferController.requestTransfer);
router.get('/me', verifyToken, transferController.getMyTransfers);
router.get('/requests', verifyToken, isAdmin, transferController.getTransferRequests);
router.put('/:id/status', verifyToken, isAdmin, transferController.processTransfer);
router.post('/initiate', verifyToken, isAdmin, transferController.initiateManualTransfer);

module.exports = router;
