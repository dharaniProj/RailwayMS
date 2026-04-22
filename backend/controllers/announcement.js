const db = require('../config/db');

exports.createAnnouncement = async (req, res) => {
    const { title, message, duration_hours } = req.body;
    try {
        const hours = parseInt(duration_hours) || 24;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);

        const result = await db.query(
            'INSERT INTO announcements (title, message, duration_hours, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, message, hours, expiresAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, message, duration_hours } = req.body;
    try {
        const hours = parseInt(duration_hours) || 24;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);

        const result = await db.query(
            'UPDATE announcements SET title = $1, message = $2, duration_hours = $3, expires_at = $4 WHERE id = $5 RETURNING *',
            [title, message, hours, expiresAt, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM announcements WHERE id = $1', [id]);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch active announcements (expires_at > NOW())
        // And check if the current user has read them
        const result = await db.query(`
            SELECT a.id, a.title, a.message, a.created_at,
                   CASE WHEN ar.employee_id IS NOT NULL THEN true ELSE false END as is_read
            FROM announcements a
            LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.employee_id = $1
            WHERE a.expires_at > NOW()
            ORDER BY a.created_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.user.id;

        await db.query(
            'INSERT INTO announcement_reads (announcement_id, employee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [announcementId, userId]
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Error marking announcement as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
