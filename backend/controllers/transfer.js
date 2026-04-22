const db = require('../config/db');
const { createNotification } = require('./notification');

exports.requestTransfer = async (req, res) => {
    try {
        const { to_location, reason, effective_date } = req.body;
        const userId = req.user.id;

        // Fetch current location
        const empRes = await db.query('SELECT work_location FROM employees WHERE id = $1', [userId]);
        const from_location = empRes.rows[0]?.work_location || 'Not Specified';

        const result = await db.query(
            'INSERT INTO transfers (employee_id, from_location, to_location, reason, effective_date, status) VALUES ($1, $2, $3, $4, $5, \'pending\') RETURNING *',
            [userId, from_location, to_location, reason, effective_date]
        );

        // Notify Admin
        const adminRes = await db.query('SELECT id FROM employees WHERE role = \'admin\'');
        for (let admin of adminRes.rows) {
            await createNotification(admin.id, 'New Transfer Request', `Employee ${req.user.employee_id} has requested a transfer to ${to_location}.`, 'transfer');
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error requesting transfer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTransferRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.*, e.name as employee_name, e.employee_id as employee_code 
            FROM transfers t 
            JOIN employees e ON t.employee_id = e.id 
            ORDER BY t.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transfer requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyTransfers = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT * FROM transfers WHERE employee_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching own transfers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.processTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        
        const result = await db.query(
            'UPDATE transfers SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'Transfer request not found' });

        const transfer = result.rows[0];

        if (status === 'approved') {
            // Update employee's current location
            await db.query('UPDATE employees SET work_location = $1 WHERE id = $2', [transfer.to_location, transfer.employee_id]);
        }

        // Notify Employee
        await createNotification(
            transfer.employee_id, 
            `Transfer ${status.toUpperCase()}`, 
            `Your transfer request to ${transfer.to_location} has been ${status}.`, 
            'transfer'
        );

        res.json(transfer);
    } catch (error) {
        console.error('Error processing transfer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.initiateManualTransfer = async (req, res) => {
    try {
        const { employeeId, to_location, effective_date, reason } = req.body;
        
        const empRes = await db.query('SELECT work_location FROM employees WHERE id = $1', [employeeId]);
        const from_location = empRes.rows[0]?.work_location || 'Not Specified';

        const result = await db.query(
            'INSERT INTO transfers (employee_id, from_location, to_location, reason, effective_date, status) VALUES ($1, $2, $3, $4, $5, \'approved\') RETURNING *',
            [employeeId, from_location, to_location, reason, effective_date]
        );

        // Update employee location
        await db.query('UPDATE employees SET work_location = $1 WHERE id = $2', [to_location, employeeId]);

        // Notify Employee
        await createNotification(
            employeeId, 
            'Direct Transfer', 
            `You have been transferred to ${to_location} effective from ${effective_date}.`, 
            'transfer'
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error initiating manual transfer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
