const db = require('../config/db');
const { createNotification } = require('./notification');

exports.applyLeave = async (req, res) => {
    try {
        const { subject, reason, start_date, end_date } = req.body;
        const userId = req.user.id;

        const result = await db.query(
            'INSERT INTO leaves (employee_id, subject, reason, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, \'pending\') RETURNING *',
            [userId, subject, reason, start_date, end_date]
        );

        // Notify Admin
        const adminRes = await db.query('SELECT id FROM employees WHERE role = \'admin\'');
        for (let admin of adminRes.rows) {
            await createNotification(admin.id, 'New Leave Request', `Employee ${req.user.employee_id} has applied for leave.`, 'leave');
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeaveRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, e.name as employee_name, e.employee_id as employee_code 
            FROM leaves l 
            JOIN employees e ON l.employee_id = e.id 
            ORDER BY l.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT * FROM leaves WHERE employee_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching own leaves:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        
        const result = await db.query(
            'UPDATE leaves SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'Leave request not found' });

        const leave = result.rows[0];

        if (status === 'approved') {
            // Calculate days: (end - start) + 1
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            await db.query('UPDATE employees SET leave_count = leave_count - $1 WHERE id = $2', [diffDays, leave.employee_id]);
        }

        // Notify Employee
        await createNotification(
            leave.employee_id, 
            `Leave ${status.toUpperCase()}`, 
            `Your leave request for "${leave.subject}" has been ${status}.`, 
            'leave'
        );

        res.json(leave);
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getEmployeeLeaveDetails = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const leaveRes = await db.query('SELECT * FROM leaves WHERE employee_id = $1', [employeeId]);
        const empRes = await db.query('SELECT leave_count, name FROM employees WHERE id = $1', [employeeId]);
        
        res.json({
            leaves: leaveRes.rows,
            leave_count: empRes.rows[0]?.leave_count || 0,
            name: empRes.rows[0]?.name
        });
    } catch (error) {
        console.error('Error fetching employee leave details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateLeaveCount = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { leave_count } = req.body;
        
        await db.query('UPDATE employees SET leave_count = $1 WHERE id = $2', [leave_count, employeeId]);
        
        res.json({ message: 'Leave count updated successfully' });
    } catch (error) {
        console.error('Error updating leave count:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
