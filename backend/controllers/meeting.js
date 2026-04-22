const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// ─── Helper: determine Cloudinary resource_type ───────────────────────────────
// Images and PDFs → 'image' to bypass strict raw delivery blocks
const getResourceType = (mimetype) => {
    if (['image/jpeg', 'image/png', 'application/pdf'].includes(mimetype)) return 'image';
    return 'raw';
};

const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        Readable.from(buffer).pipe(stream);
    });
};

// ─── Create Meeting ──────────────────────────────────────────────────────────
exports.createMeeting = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const { title, meeting_date, meeting_time, type, link, location, agenda, participants } = req.body;
        
        if (!title || !meeting_date || !meeting_time || !type) {
            return res.status(400).json({ message: 'Title, date, time, and type are required.' });
        }

        // Insert meeting
        const meetingRes = await client.query(`
            INSERT INTO meetings (title, meeting_date, meeting_time, type, link, location, agenda, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [title, meeting_date, meeting_time, type, link || null, location || null, agenda || null, req.user.id]);
        
        const meetingId = meetingRes.rows[0].id;

        // Parse participants (expecting an array of employee IDs)
        let participantIds = [];
        if (participants) {
            try {
                participantIds = JSON.parse(participants);
            } catch (e) {
                participantIds = [];
            }
        }

        // Insert participants and send notifications
        if (participantIds.length > 0) {
            for (const empId of participantIds) {
                await client.query(`
                    INSERT INTO meeting_participants (meeting_id, employee_id, status)
                    VALUES ($1, $2, 'Pending')
                `, [meetingId, empId]);

                // Create notification for each participant
                await client.query(`
                    INSERT INTO notifications (user_id, title, message, type)
                    VALUES ($1, $2, $3, 'system')
                `, [
                    empId, 
                    'New Meeting Scheduled', 
                    `You have been invited to a meeting: "${title}" on ${meeting_date} at ${meeting_time}.`
                ]);
            }
        }

        // Handle document uploads if any
        if (req.files && req.files.documents && req.files.documents.length > 0) {
            if (!process.env.CLOUDINARY_CLOUD_NAME) {
                throw new Error('Cloudinary is not configured.');
            }

            for (const file of req.files.documents) {
                const timestamp = Date.now();
                const originalName = file.originalname.replace(/\s+/g, '_');
                const publicId = `meeting-docs/mtg_${meetingId}/${timestamp}_${originalName}`;
                const resourceType = getResourceType(file.mimetype);

                const uploadResult = await uploadToCloudinary(file.buffer, {
                    public_id: publicId,
                    resource_type: resourceType,
                    folder: ''
                });

                await client.query(`
                    INSERT INTO meeting_documents (meeting_id, file_url, file_name)
                    VALUES ($1, $2, $3)
                `, [meetingId, uploadResult.secure_url, file.originalname]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Meeting created successfully.', meetingId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating meeting:', error);
        res.status(500).json({ message: 'Failed to create meeting: ' + error.message });
    } finally {
        client.release();
    }
};

// ─── Get All Meetings (Admin) ────────────────────────────────────────────────
exports.getAllMeetings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT m.*, e.name as creator_name,
                   (SELECT json_agg(json_build_object('id', p.id, 'employee_id', p.employee_id, 'name', emp.name, 'status', p.status))
                    FROM meeting_participants p
                    JOIN employees emp ON p.employee_id = emp.id
                    WHERE p.meeting_id = m.id) as participants,
                   (SELECT json_agg(json_build_object('id', d.id, 'file_url', d.file_url, 'file_name', d.file_name))
                    FROM meeting_documents d
                    WHERE d.meeting_id = m.id) as documents
            FROM meetings m
            LEFT JOIN employees e ON m.created_by = e.id
            ORDER BY m.meeting_date DESC, m.meeting_time DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching admin meetings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Get Employee Meetings ───────────────────────────────────────────────────
exports.getEmployeeMeetings = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const result = await db.query(`
            SELECT m.*, p.status as my_status, p.id as participant_record_id, e.name as creator_name,
                   (SELECT json_agg(json_build_object('id', d.id, 'file_url', d.file_url, 'file_name', d.file_name))
                    FROM meeting_documents d
                    WHERE d.meeting_id = m.id) as documents
            FROM meetings m
            JOIN meeting_participants p ON m.id = p.meeting_id
            LEFT JOIN employees e ON m.created_by = e.id
            WHERE p.employee_id = $1
            ORDER BY m.meeting_date DESC, m.meeting_time DESC
        `, [employeeId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employee meetings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Confirm Attendance ──────────────────────────────────────────────────────
exports.confirmAttendance = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const employeeId = req.user.id;

        const result = await db.query(`
            UPDATE meeting_participants
            SET status = 'Confirmed'
            WHERE meeting_id = $1 AND employee_id = $2
            RETURNING *
        `, [meeting_id, employeeId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Participant record not found.' });
        }

        res.json({ message: 'Attendance confirmed successfully.' });
    } catch (error) {
        console.error('Error confirming attendance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── Upload Minutes of Meeting (Admin) ───────────────────────────────────────
exports.uploadMoM = async (req, res) => {
    try {
        const { meeting_id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\s+/g, '_');
        const publicId = `meeting-mom/mtg_${meeting_id}/${timestamp}_${originalName}`;
        const resourceType = getResourceType(req.file.mimetype);

        const uploadResult = await uploadToCloudinary(req.file.buffer, {
            public_id: publicId,
            resource_type: resourceType,
            folder: ''
        });

        await db.query(`
            UPDATE meetings
            SET mom_url = $1, status = 'Completed', updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [uploadResult.secure_url, meeting_id]);

        res.json({ message: 'Minutes of Meeting uploaded successfully.', mom_url: uploadResult.secure_url });
    } catch (error) {
        console.error('Error uploading MoM:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
