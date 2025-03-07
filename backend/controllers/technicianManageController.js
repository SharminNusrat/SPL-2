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
    const q = 'UPDATE users SET is_active = 1 WHERE id = ? AND role = "technician"';
    db.query(q, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', error: 'Technician not found' });
        }
        res.json({ status: 'success', message: 'Technician activated successfully' });
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