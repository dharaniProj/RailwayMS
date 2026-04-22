const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.registerEmployee = async (req, res) => {
    try {
        const data = req.body;
        
        // Generate Password: FirstName + @ + BirthYear
        // e.g. "John Doe" -> "John", dob = "1990-05-15" -> "1990" => "John@1990"
        const firstName = data.name ? data.name.split(' ')[0] : 'User';
        const birthYear = (data.date_of_birth && !isNaN(new Date(data.date_of_birth).getTime())) 
            ? new Date(data.date_of_birth).getFullYear() 
            : new Date().getFullYear();
        const generatedPassword = `${firstName}@${birthYear}`;
        
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const uploadFileToCloud = (buffer, mimetype, folder) => {
            const cloudinary = require('../config/cloudinary');
            const { Readable } = require('stream');
            const resourceType = ['image/jpeg', 'image/png'].includes(mimetype) ? 'image' : 'raw';
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder, resource_type: resourceType },
                    (err, result) => err ? reject(err) : resolve(result.secure_url)
                );
                Readable.from(buffer).pipe(stream);
            });
        };

        let profilePhotoUrl = null;
        let healthCardUrl = null;
        let otherDocumentsUrls = [];

        if (req.files && process.env.CLOUDINARY_CLOUD_NAME) {
            if (req.files.profile_photo && req.files.profile_photo.length > 0) {
                const f = req.files.profile_photo[0];
                profilePhotoUrl = await uploadFileToCloud(f.buffer, f.mimetype, 'employee-profiles');
            }
            if (req.files.health_card && req.files.health_card.length > 0) {
                const f = req.files.health_card[0];
                healthCardUrl = await uploadFileToCloud(f.buffer, f.mimetype, 'health-cards');
            }
            if (req.files.other_documents && req.files.other_documents.length > 0) {
                for (const file of req.files.other_documents) {
                    const url = await uploadFileToCloud(file.buffer, file.mimetype, 'employee-docs-reg');
                    otherDocumentsUrls.push(url);
                }
            }
        }

        
        const query = `
            INSERT INTO employees (
                employee_id, name, email, password, role,
                phone_number, date_of_birth, gender, marital_status, spouse_name,
                department, designation, joining_date, employment_type, work_location,
                salary, official_assets, aadhaar_number, pan_number,
                health_card_number, health_card_url, profile_photo_url, other_documents_urls
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19,
                $20, $21, $22, $23
            ) RETURNING id
        `;
        
        const values = [
            data.employee_id, data.name, data.email, hashedPassword, data.role || 'employee',
            data.phone_number || null, data.date_of_birth || null, data.gender || null, data.marital_status || null, data.spouse_name || null,
            data.department || null, data.designation || null, data.joining_date || null, data.employment_type || null, data.work_location || null,
            data.salary ? parseFloat(data.salary) : null, data.official_assets || null, data.aadhaar_number || null, data.pan_number || null,
            data.health_card_number || null, healthCardUrl, profilePhotoUrl, JSON.stringify(otherDocumentsUrls)
        ];
        
        await db.query(query, values);
        
        res.status(201).json({ 
            message: 'Employee registered successfully',
            generated_password: generatedPassword,
            username: data.employee_id
        });
        
    } catch (error) {
        console.error('Error registering employee:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, employee_id, name, email, department, designation, role, salary, joining_date, pan_number, aadhaar_number, work_location, leave_count FROM employees ORDER BY created_at DESC',
            []
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query('SELECT * FROM employees WHERE id = $1', [userId]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = result.rows[0];
        delete user.password; // do not send password
        res.json(user);
    } catch (error) {
        console.error('Error fetching me:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSalary = async (req, res) => {
    try {
        const { id } = req.params;
        const { salary } = req.body;

        if (!salary || isNaN(parseFloat(salary)) || parseFloat(salary) <= 0) {
            return res.status(400).json({ message: 'Invalid salary value.' });
        }

        const result = await db.query(
            'UPDATE employees SET salary = $1 WHERE id = $2 RETURNING id, employee_id, name, salary',
            [parseFloat(salary), id]
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'Employee not found.' });

        res.json({ message: 'Salary updated successfully.', employee: result.rows[0] });
    } catch (error) {
        console.error('Error updating salary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM employees WHERE id = $1', [id]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch employee details to generate default password
        const empResult = await db.query('SELECT name, date_of_birth FROM employees WHERE id = $1', [id]);
        if (empResult.rowCount === 0) return res.status(404).json({ message: 'Employee not found' });
        
        const emp = empResult.rows[0];
        const firstName = emp.name ? emp.name.split(' ')[0] : 'User';
        const birthYear = (emp.date_of_birth && !isNaN(new Date(emp.date_of_birth).getTime())) 
            ? new Date(emp.date_of_birth).getFullYear() 
            : new Date().getFullYear();
        const generatedPassword = `${firstName}@${birthYear}`;
        
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        await db.query('UPDATE employees SET password = $1 WHERE id = $2', [hashedPassword, id]);
        
        res.json({ message: 'Password reset successfully', new_password: generatedPassword });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { name, employee_id: newUsername, current_password, new_password } = req.body;

        const adminRes = await db.query('SELECT * FROM employees WHERE id = $1 AND role = $2', [adminId, 'admin']);
        if (adminRes.rowCount === 0) return res.status(404).json({ message: 'Admin not found.' });
        const admin = adminRes.rows[0];

        const updates = [];
        const values = [];

        if (name && name.trim()) {
            values.push(name.trim());
            updates.push(`name = $${values.length}`);
        }

        if (newUsername && newUsername.trim() && newUsername.trim() !== admin.employee_id) {
            const exists = await db.query('SELECT id FROM employees WHERE employee_id = $1 AND id != $2', [newUsername.trim(), adminId]);
            if (exists.rowCount > 0) return res.status(409).json({ message: 'That username is already taken.' });
            values.push(newUsername.trim());
            updates.push(`employee_id = $${values.length}`);
        }

        if (new_password) {
            if (!current_password) return res.status(400).json({ message: 'Current password is required to set a new password.' });
            const match = await bcrypt.compare(current_password, admin.password);
            if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });
            if (new_password.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
            values.push(await bcrypt.hash(new_password, 10));
            updates.push(`password = $${values.length}`);
        }

        if (updates.length === 0) return res.status(400).json({ message: 'No changes provided.' });

        values.push(adminId);
        const result = await db.query(
            `UPDATE employees SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id, employee_id, name, email, role`,
            values
        );

        res.json({ message: 'Profile updated successfully.', admin: result.rows[0] });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

