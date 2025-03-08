const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
//const authenticateToken = require('../middleware/authMiddleware');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

const getAllTechnicians = (req, res) => {
    const q = `
        SELECT u.id, u.fname, u.lname, u.email, u.phn_no, u.is_active, 
               d.details_value AS expertise, d2.details_value AS availability
        FROM users u
        LEFT JOIN user_details d ON u.id = d.user_id AND d.details_key = 'expertise'
        LEFT JOIN user_details d2 ON u.id = d2.user_id AND d2.details_key = 'availability'
        WHERE u.role = 'technician'
    `;
    db.query(q, (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }
        res.json({ status: 'success', technicians: results });
    });
};

const deactivateTechnician = (req, res) => {
    const { id } = req.params;
    const q = 'UPDATE users SET is_active = 0 WHERE id = ? AND role = "technician"';
    db.query(q, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', error: 'Technician not found' });
        }
        res.json({ status: 'success', message: 'Technician deactivated successfully' });
    });
};

const activateTechnician = (req, res) => {
    const { id } = req.params;
    
    const getUserQuery = 'SELECT email FROM users WHERE id = ? AND role = "technician"';
    
    db.query(getUserQuery, [id], (userErr, userResult) => {
        if (userErr) {
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }
        
        if (userResult.length === 0) {
            return res.status(404).json({ status: 'error', error: 'Technician not found' });
        }
        
        const userEmail = userResult[0].email;
        
        const updateQuery = 'UPDATE users SET is_active = 1 WHERE id = ? AND role = "technician"';
        
        db.query(updateQuery, [id], async (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).json({ status: 'error', error: 'Database error' });
            }
            
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ status: 'error', error: 'Technician not found' });
            }
            
            const mailSubject = 'Account Activation';
            const content = `
                <h1>Your Account Has Been Activated</h1>
                <p>Dear Technician,</p>
                <p>We are pleased to inform you that your technician account has been successfully activated. You can now log in to our system and start using all the features available to technicians.</p>
                <p>Thank you for joining our team!</p>
                <p>Best regards,<br>The Admin Team</p>
            `;
            
            try {
                await sendMail(userEmail, mailSubject, content);
                res.json({ status: 'success', message: 'Technician activated successfully and notification email sent' });
            } catch (emailErr) {
                console.error('Failed to send email notification:', emailErr);
                res.json({ 
                    status: 'success', 
                    message: 'Technician activated successfully, but email notification failed',
                    emailError: emailErr.message
                });
            }
        });
    });
};

const getTechnicianById = (req, res) => {
    const { id } = req.params;
    const q = `
        SELECT u.id, u.fname, u.lname, u.email, u.phn_no, u.is_active, 
               d.details_value AS expertise, d2.details_value AS availability
        FROM users u
        LEFT JOIN user_details d ON u.id = d.user_id AND d.details_key = 'expertise'
        LEFT JOIN user_details d2 ON u.id = d2.user_id AND d2.details_key = 'availability'
        WHERE u.id = ? AND u.role = 'technician'
    `;
    db.query(q, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ status: 'error', error: 'Technician not found' });
        }
        res.json({ status: 'success', technician: results[0] });
    });
};
module.exports = { getAllTechnicians, getTechnicianById, deactivateTechnician, activateTechnician };