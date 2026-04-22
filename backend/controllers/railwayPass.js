const db = require('../config/db');

exports.applyPass = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { full_name, dob, contact_no, address, route_from, route_to } = req.body;

        const result = await db.query(
            `INSERT INTO railway_passes (employee_id, full_name, dob, contact_no, address, route_from, route_to) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [employeeId, full_name, dob, contact_no, address, route_from, route_to]
        );

        res.status(201).json({ message: 'Railway Pass application submitted successfully', application: result.rows[0] });
    } catch (error) {
        console.error('Error applying for railway pass:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const result = await db.query('SELECT * FROM railway_passes WHERE employee_id = $1 ORDER BY created_at DESC', [employeeId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching own pass applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT rp.*, e.employee_id as emp_code, e.profile_photo_url 
            FROM railway_passes rp
            JOIN employees e ON rp.employee_id = e.id
            ORDER BY rp.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching all pass applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePassStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(
            'UPDATE railway_passes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'Application not found' });

        const application = result.rows[0];

        // If status is "Completed", create a notification for the employee
        if (status === 'Completed' || status === 'In Process') {
            const message = status === 'Completed' 
                ? 'Your Railway Pass application has been completed! Please collect it from the office or check your documents section.' 
                : `Your Railway Pass application is now ${status}.`;
            
            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
                [application.employee_id, 'Railway Pass Update', message, 'pass']
            );
        }

        res.json({ message: 'Status updated successfully', application });
    } catch (error) {
        console.error('Error updating pass status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
