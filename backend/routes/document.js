const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/document');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Multer — memory storage, 5 MB limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG.'));
        }
    },
});

router.post('/upload', verifyToken, upload.single('file'), documentController.uploadDocument);

// Admin: get all documents (optionally filtered)
router.get('/all', verifyToken, isAdmin, documentController.getAllDocuments);

// Admin or Employee: get documents for a specific employee
// Employee can only fetch their own (enforced in controller)
router.get('/:emp_id', verifyToken, documentController.getDocumentsByEmployee);

// Admin: delete a document
router.delete('/:doc_id', verifyToken, isAdmin, documentController.deleteDocument);

module.exports = router;
