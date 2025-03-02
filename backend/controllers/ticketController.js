const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const authenticateToken = require('../middleware/authMiddleware');

const createTicket = (req, res) => {
    const { category_id, computer_id, title, roomNumber, description } = req.body;
    const user_id = req.user.id; 
    const created_at = new Date();
    
    if (!category_id || !computer_id || !title || !roomNumber || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    
    const getCategoryQuery = `
        SELECT name FROM category WHERE id = ?
    `;

    db.query(getCategoryQuery, [category_id], (err, categoryResults) => {
        if (err) {
            console.error('Error fetching category:', err);
            return res.status(500).json({ error: 'Database error while determining category.' });
        }

        if (categoryResults.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        const categoryName = categoryResults[0].name;
        
        const getTechnicianQuery = `SELECT 
            u.id
            FROM 
                users u
            JOIN 
                user_details ud1 
                ON u.id = ud1.user_id 
                AND ud1.details_key = 'expertise' 
                AND ud1.details_value = ?
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
                    ticket_status = 'Open' OR ticket_status = 'In-Progress'
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

        db.query(getTechnicianQuery, [categoryName], (err, results) => {
            if (err) {
                console.error('Error fetching technician for load balancing:', err);
                return res.status(500).json({ error: 'Database error while finding technician.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No technicians available with required expertise.' });
            }

            const assigned_to = results[0].id;

            const insertTicketQuery = `
                INSERT INTO ticket (user_id, category_id, computer_id, title, roomNumber, description, ticket_status, created_at, assigned_to,updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const ticketStatus = 'In-Progress';
            
            db.query(
                insertTicketQuery,
                [user_id, category_id, computer_id, title, roomNumber, description, ticketStatus, created_at, assigned_to, created_at],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting ticket:', err);
                        return res.status(500).json({ error: 'Database error while creating ticket.' });
                    }

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
    });
};

const updateTicketStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Resolved', 'Closed']; // Allowed statuses
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

        // Check if the ticket is already closed
        if (ticket.ticket_status === 'Closed') {
            return res.status(400).json({ error: 'Ticket is already closed and cannot be modified.' });
        }

        // Proceed with updating the status to Resolved
        if (status === 'Resolved') {
            const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000).toString();
            const verificationCode = generateRandomCode();

            const getEmailQuery = `SELECT email FROM users WHERE id = ?`;
            db.query(getEmailQuery, [ticket.user_id], (emailErr, emailResults) => {
                if (emailErr || emailResults.length === 0) {
                    return res.status(500).json({ error: 'Error fetching user email.' });
                }

                const email = emailResults[0].email;

                const mailSubject = 'Ticket Verification Code';
                const content = `Your verification code to close the ticket #${id} is: ${verificationCode}`;

                sendMail(email, mailSubject, content);
                    const updateQuery = `UPDATE ticket SET ticket_status = ?, verification_code = ?, updated_at = NOW() WHERE id = ?`;
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
        } else if (status === 'Closed') {
            return res.status(400).json({ error: 'To close a ticket, use the verification endpoint.' });
        }
    });
};

const verifyTicket= (req, res) => {
    const { id } = req.params;
    const { code } = req.body;

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
        if (verification_code !== code) {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }

        const updateQuery = `UPDATE ticket SET ticket_status = 'Closed', verification_code = NULL, updated_at = NOW() WHERE id = ?`;

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
const getTicketsByUser = (req, res) => {
    const userId = req.user.id; 

    const query = `
        SELECT 
            t.* 
        FROM 
            ticket t
        WHERE 
            t.user_id = ?
            OR t.assigned_to = ? 
    `;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(200).json({ tickets: results });
    });
};

module.exports = {createTicket,updateTicketStatus,verifyTicket,getAllTickets, getTicketbyId,getTicketsByUser};