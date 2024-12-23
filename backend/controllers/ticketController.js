const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const authenticateToken = require('../middleware/authMiddleware');

// Create Ticket API
const createTicket = (req, res) => {
    const { category_id, computer_id, title, roomNumber, description } = req.body;
    const user_id = req.user.id; // Extract user_id from the JWT payload
    const ticket_status = 'Open';
    const created_at = new Date();

    // Validate required fields
    if (!category_id || !computer_id || !title || !roomNumber || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

 const getTechnicianQuery = `SELECT 
u.id
FROM 
users u
JOIN 
user_details ud1 
ON u.id = ud1.user_id 
AND ud1.details_key = 'expertise' 
AND ud1.details_value = 'Hardware'
LEFT JOIN 
user_details ud2 
ON u.id = ud2.user_id 
AND ud2.details_key = 'last_assigned_at'
LEFT JOIN 
(SELECT 
    assigned_to, 
    COUNT(*) AS open_tickets 
 FROM 
    ticket 
 WHERE 
    ticket_status = 'Open' 
 GROUP BY 
    assigned_to
) t 
ON u.id = t.assigned_to
WHERE 
u.role = 'technician'
ORDER BY 
t.open_tickets ASC,
COALESCE(ud2.details_value, '1970-01-01') ASC
LIMIT 1;
`;


    db.query(getTechnicianQuery, (err, results) => {
        if (err) {
            console.error('Error fetching technician for load balancing:', err);
            return res.status(500).json({ error: 'Database error while finding technician.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No technicians available for assignment.' });
        }

        const assigned_to = results[0].id;

        // Step 2: Insert the New Ticket
        const insertTicketQuery = `
            INSERT INTO ticket (user_id, category_id, computer_id, title, roomNumber, description, ticket_status, created_at, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const ticketStatus = 'In-Progress';
        db.query(
            insertTicketQuery,
            [user_id, category_id, computer_id, title, roomNumber, description, ticketStatus, created_at, assigned_to],
            (err, result) => {
                if (err) {
                    console.error('Error inserting ticket:', err);
                    return res.status(500).json({ error: 'Database error while creating ticket.' });
                }

                // Step 3: Update Technician's Last Assigned Timestamp
                const updateLastAssignedQuery = `
                    INSERT INTO user_details (user_id, details_key, details_value)
                    VALUES (?, 'last_assigned_at', NOW())
                    ON DUPLICATE KEY UPDATE details_value = NOW();
                `;

                db.query(updateLastAssignedQuery, [assigned_to], (err) => {
                    if (err) {
                        console.error('Error updating last_assigned_at:', err);
                        return res.status(500).json({ error: 'Database error while updating technician info.' });
                    }

                    return res.status(201).json({
                        message: 'Ticket created successfully',
                        ticket_id: result.insertId,
                        assigned_to: assigned_to,
                    });
                });
            }
        );
    });
};

// Update Ticket Status
const updateTicketStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Resolved', 'Closed'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const fetchQuery = `SELECT user_id, ticket_status FROM ticket WHERE id = ?`;

    db.query(fetchQuery, [id], (fetchErr, results) => {
        if (fetchErr) {
            console.error(fetchErr);
            return res.status(500).json({ error: 'Database error while fetching ticket.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }

        const ticket = results[0];

        if (status === 'Resolved') {
            const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
            const verificationCode = generateRandomCode();

            const getEmailQuery = `SELECT email FROM users WHERE id = ?`;
            db.query(getEmailQuery, [ticket.user_id], (emailErr, emailResults) => {
                if (emailErr || emailResults.length === 0) {
                    return res.status(500).json({ error: 'Error fetching user email.' });
                }

                const email = emailResults[0].email;

                // Send email using the sendMail function from sendmail.js
                const mailSubject = 'Ticket Verification Code';
                const content = `Your verification code to close the ticket #${id} is: ${verificationCode}`;

                sendMail(email, mailSubject, content);
                    const updateQuery = `UPDATE ticket SET ticket_status = ?, verification_code = ? WHERE id = ?`;
                    db.query(updateQuery, [status, verificationCode, id], (updateErr) => {
                        if (updateErr) {
                            console.error(updateErr);
                            return res.status(500).json({ error: 'Database error updating ticket.' });
                        }

                        return res.status(200).json({
                            message: 'Ticket status updated to Resolved. Verification code sent.',
                            verification_code: verificationCode // For testing purposes
                        });
                    });
           });
        } else {
            return res.status(400).json({ error: 'To close a ticket, use the verification endpoint.' });
        }
    });
};

// Verify Code and Close Ticket
const verifyTicket= (req, res) => {
    const { id } = req.params;
    const { code } = req.body;

    // Step 1: Fetch ticket and check the verification code
    const fetchQuery = `SELECT verification_code FROM ticket WHERE id = ?`;

    db.query(fetchQuery, [id], (fetchErr, results) => {
        if (fetchErr) {
            console.error(fetchErr);
            return res.status(500).json({ error: 'Database error while fetching ticket.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Ticket not found.' });
        }

        const { verification_code } = results[0];

        // Step 2: Compare the provided code with the stored code
        if (verification_code !== code) {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }

        // Step 3: Update ticket status to Closed
        const updateQuery = `UPDATE ticket SET ticket_status = 'Closed', verification_code = NULL WHERE id = ?`;

        db.query(updateQuery, [id], (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).json({ error: 'Database error while closing ticket.' });
            }

            return res.status(200).json({ message: 'Ticket successfully closed.' });
        });
    });
};

const getAllTickets = (req, res) => {
    const query = `SELECT * FROM ticket`;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        return res.status(200).json({ ticket: results });
    });
};
const getTicketbyId = (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM ticket WHERE id = ?`;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        return res.status(200).json({ ticket: results[0] });
    });
}
module.exports = {createTicket,updateTicketStatus,verifyTicket,getAllTickets, getTicketbyId};