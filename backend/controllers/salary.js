const db = require('../config/db');

exports.getEmployeeSalaryHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await db.query('SELECT * FROM salary_history WHERE employee_id = $1 ORDER BY month_year DESC', [employeeId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching salary history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMySalaryHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT * FROM salary_history WHERE employee_id = $1 ORDER BY month_year DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching own salary history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.generateSalary = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month_year } = req.body;

        // Fetch employee's annual salary
        const empRes = await db.query('SELECT salary FROM employees WHERE id = $1', [employeeId]);
        if (empRes.rowCount === 0) return res.status(404).json({ message: 'Employee not found' });
        
        const annualSalary = parseFloat(empRes.rows[0].salary);
        if (!annualSalary || isNaN(annualSalary)) {
            return res.status(400).json({ message: 'Employee does not have a valid salary set. Please update their profile.' });
        }

        const monthlySalary = annualSalary / 12;
        const basicPay = monthlySalary * 0.50;
        const hra = monthlySalary * 0.20;
        const allowances = monthlySalary * 0.30;
        const deductions = basicPay * 0.12; // PF deduction
        const netSalary = (basicPay + hra + allowances) - deductions;

        const result = await db.query(
            'INSERT INTO salary_history (employee_id, month_year, basic_pay, hra, allowances, deductions, net_salary, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [employeeId, month_year, basicPay, hra, allowances, deductions, netSalary, 'paid']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error generating salary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
