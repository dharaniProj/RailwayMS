const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];

const ALLOWED_CATEGORIES = ['Salary', 'Leave', 'ID Proof', 'Transfer', 'Work', 'Other'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Helper: determine Cloudinary resource_type ───────────────────────────────
// Images → 'image', everything else (PDF, DOC, DOCX) → 'raw'
const getResourceType = (mimetype) => {
    if (['image/jpeg', 'image/png'].includes(mimetype)) return 'image';
    return 'raw';
};

// ─── Helper: upload buffer to Cloudinary ─────────────────────────────────────
const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        Readable.from(buffer).pipe(stream);
    });
};

// ─── Upload Document ──────────────────────────────────────────────────────────
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

        const { emp_id, title, category } = req.body;

        if (!emp_id)                                   return res.status(400).json({ message: 'Employee ID is required.' });
        if (!title || title.trim() === '')             return res.status(400).json({ message: 'Document title is required.' });
        if (!ALLOWED_CATEGORIES.includes(category))   return res.status(400).json({ message: `Invalid category. Choose from: ${ALLOWED_CATEGORIES.join(', ')}.` });
        if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) return res.status(400).json({ message: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG.' });
        if (req.file.size > MAX_FILE_SIZE)             return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });

        // Employees can only upload documents for themselves
        if (req.user.role !== 'admin' && req.user.id !== parseInt(emp_id)) {
            return res.status(403).json({ message: 'Employees can only upload documents for themselves.' });
        }

        // Verify Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(503).json({ message: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.' });
        }

        // Verify employee exists
        const empCheck = await db.query('SELECT id, employee_id FROM employees WHERE id = $1', [emp_id]);
        if (empCheck.rowCount === 0) return res.status(404).json({ message: 'Employee not found.' });
        const employee = empCheck.rows[0];

        // Build structured folder path (mirrors old Firebase structure)
        const timestamp = Date.now();
        const safeFileName = req.file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '')
            .replace(/\.[^/.]+$/, ''); // strip extension — Cloudinary handles it

        const publicId   = `employee-docs/emp_${employee.employee_id}/${timestamp}_${safeFileName}`;
        const resourceType = getResourceType(req.file.mimetype);

        // Upload to Cloudinary
        let uploadResult;
        try {
            uploadResult = await uploadToCloudinary(req.file.buffer, {
                public_id:     publicId,
                resource_type: resourceType,
                folder:        '',              // already embedded in public_id
                overwrite:     false,
                context: {
                    uploaded_by: req.user.employee_id,
                    emp_id:      employee.employee_id,
                    title:       title,
                    category:    category,
                },
            });
        } catch (cloudErr) {
            console.error('[Cloudinary] Upload error:', cloudErr.message);
            return res.status(503).json({ message: 'Cloud upload failed: ' + cloudErr.message });
        }

        const fileUrl = uploadResult.secure_url;   // HTTPS URL, always permanent
        const storedPublicId = uploadResult.public_id; // e.g. employee-docs/emp_EMP101/...

        // Save metadata to PostgreSQL
        const result = await db.query(
            `INSERT INTO documents (employee_id, title, category, file_url, file_name, file_type, file_size, uploaded_by, storage_public_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                emp_id,
                title.trim(),
                category,
                fileUrl,
                req.file.originalname,
                req.file.mimetype,
                req.file.size,
                req.user.employee_id,
                storedPublicId,
            ]
        );

        res.status(201).json({
            message: 'Document uploaded successfully.',
            document: result.rows[0],
        });
    } catch (error) {
        console.error('[DocumentController] Upload failed. Error details:', error);
        res.status(500).json({ message: `Upload failed: ${error.message}. (Backend check: Ensure file was saved and server was restarted)` });
    }
};

// ─── Get Documents by Employee ────────────────────────────────────────────────
exports.getDocumentsByEmployee = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const requester  = req.user;

        // Employees can only see their own documents
        if (requester.role !== 'admin' && requester.id !== parseInt(emp_id)) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { category } = req.query;

        let queryText = `
            SELECT d.*, e.name AS employee_name, e.employee_id AS employee_code
            FROM documents d
            JOIN employees e ON d.employee_id = e.id
            WHERE d.employee_id = $1
        `;
        const params = [emp_id];

        if (category && ALLOWED_CATEGORIES.includes(category)) {
            queryText += ' AND d.category = $2';
            params.push(category);
        }

        queryText += ' ORDER BY d.uploaded_at DESC';

        const result = await db.query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Get All Documents — Admin only ──────────────────────────────────────────
exports.getAllDocuments = async (req, res) => {
    try {
        const { category, emp_id } = req.query;

        let queryText = `
            SELECT d.*, e.name AS employee_name, e.employee_id AS employee_code
            FROM documents d
            JOIN employees e ON d.employee_id = e.id
            WHERE 1=1
        `;
        const params = [];

        if (emp_id) {
            params.push(emp_id);
            queryText += ` AND d.employee_id = $${params.length}`;
        }
        if (category && ALLOWED_CATEGORIES.includes(category)) {
            params.push(category);
            queryText += ` AND d.category = $${params.length}`;
        }

        queryText += ' ORDER BY d.uploaded_at DESC';

        const result = await db.query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all documents:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Delete Document ──────────────────────────────────────────────────────────
exports.deleteDocument = async (req, res) => {
    try {
        const { doc_id } = req.params;

        const result = await db.query('SELECT * FROM documents WHERE doc_id = $1', [doc_id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Document not found.' });

        const doc = result.rows[0];

        // Delete from Cloudinary
        if (doc.storage_public_id) {
            try {
                const resourceType = getResourceType(doc.file_type);
                await cloudinary.uploader.destroy(doc.storage_public_id, { resource_type: resourceType });
            } catch (cloudErr) {
                // Log but don't block DB deletion — file may have been deleted manually
                console.warn('[Cloudinary] Delete warning:', cloudErr.message);
            }
        }

        // Delete from PostgreSQL
        await db.query('DELETE FROM documents WHERE doc_id = $1', [doc_id]);
        res.json({ message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
