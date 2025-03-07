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

    // Get category name first
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
        
        
        const getAvailableTechniciansQuery = `SELECT 
            u.id, u.email
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
            LEFT JOIN
                user_details ud3
                ON u.id = ud3.user_id
                AND ud3.details_key = 'availability'
            WHERE 
                u.role = 'technician'
                AND u.is_active = 1
                AND (ud3.details_value = 'available' OR ud3.details_value IS NULL)
            ORDER BY 
                t.open_tickets ASC,
                COALESCE(ud2.details_value, '1970-01-01') ASC
            LIMIT 1;
        `;

        db.query(getAvailableTechniciansQuery, [categoryName], (err, results) => {
            if (err) {
                console.error('Error fetching available technicians:', err);
                return res.status(500).json({ error: 'Database error while finding technician.' });
            }

            let assigned_to = null;
            let technicianEmail = null;
            let ticketStatus = 'Open'; 
           
            if (results.length > 0) {
                assigned_to = results[0].id;
                technicianEmail = results[0].email;
                ticketStatus = 'In-Progress';
            }

            
            const getUserEmailQuery = `SELECT email FROM users WHERE id = ?`;
            
            db.query(getUserEmailQuery, [user_id], (err, userResults) => {
                if (err) {
                    console.error('Error fetching user email:', err);
                    return res.status(500).json({ error: 'Database error while getting user email.' });
                }
                
                const userEmail = userResults.length > 0 ? userResults[0].email : null;

                const insertTicketQuery = `
                    INSERT INTO ticket (user_id, category_id, computer_id, title, roomNumber, description, ticket_status, created_at, assigned_to, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.query(
                    insertTicketQuery,
                    [user_id, category_id, computer_id, title, roomNumber, description, ticketStatus, created_at, assigned_to, created_at],
                    (err, result) => {
                        if (err) {
                            console.error('Error inserting ticket:', err);
                            return res.status(500).json({ error: 'Database error while creating ticket.' });
                        }

                        const ticketId = result.insertId;

                        if (assigned_to) {
                            const updateLastAssignedQuery = `
                                INSERT INTO user_details (user_id, details_key, details_value)
                                VALUES (?, 'last_assigned_at', NOW())
                                ON DUPLICATE KEY UPDATE details_value = NOW();
                            `;

                            db.query(updateLastAssignedQuery, [assigned_to], (err) => {
                                if (err) {
                                    console.error('Error updating last_assigned_at:', err);
                                    
                                }
                            });
                            
                            
                            if (technicianEmail) {
                                const technicianMailSubject = 'New Ticket Assigned';
                                const technicianMailContent = `
                                    <h2>New Ticket Assigned</h2>
                                    <p>A new ticket has been assigned to you:</p>
                                    <ul>
                                        <li><strong>Ticket ID:</strong> ${ticketId}</li>
                                        <li><strong>Title:</strong> ${title}</li>
                                        <li><strong>Category:</strong> ${categoryName}</li>
                                        <li><strong>Room Number:</strong> ${roomNumber}</li>
                                        <li><strong>Description:</strong> ${description}</li>
                                    </ul>
                                    <p>Please login to the system to view more details and take action.</p>
                                `;
                                
                                sendMail(technicianEmail, technicianMailSubject, technicianMailContent);
                            }
                        }
                        
                        
                        if (userEmail) {
                            const userMailSubject = 'Ticket Status Update';
                            const userMailContent = assigned_to ? 
                                `
                                <h2>Your Ticket Has Been Assigned</h2>
                                <p>Your ticket has been assigned to a technician and is now in progress:</p>
                                <ul>
                                    <li><strong>Ticket ID:</strong> ${ticketId}</li>
                                    <li><strong>Title:</strong> ${title}</li>
                                    <li><strong>Status:</strong> In-Progress</li>
                                </ul>
                                <p>A technician will look into your issue soon.</p>
                                ` : 
                                `
                                <h2>Your Ticket Has Been Created</h2>
                                <p>Your ticket has been created and is awaiting assignment to a technician:</p>
                                <ul>
                                    <li><strong>Ticket ID:</strong> ${ticketId}</li>
                                    <li><strong>Title:</strong> ${title}</li>
                                    <li><strong>Status:</strong> Open</li>
                                </ul>
                                <p>You will receive another notification when a technician is assigned.</p>
                                `;
                            
                            sendMail(userEmail, userMailSubject, userMailContent);
                        }

                        const responseMessage = assigned_to 
                            ? 'Ticket created and assigned to technician successfully' 
                            : 'Ticket created successfully and waiting for available technician';

                        return res.status(201).json({
                            message: responseMessage,
                            ticket_id: ticketId,
                            ticket_status: ticketStatus,
                            assigned_to: assigned_to,
                        });
                    }
                );
            });
        });
    });
};


const processTicketQueue = () => {
    
    const getUnassignedTicketsQuery = `
        SELECT t.id, t.category_id, c.name as category_name, t.user_id, t.title, t.roomNumber, t.description
        FROM ticket t
        JOIN category c ON t.category_id = c.id
        WHERE t.ticket_status = 'Open' AND (t.assigned_to IS NULL OR t.assigned_to = 0)
        ORDER BY t.created_at ASC
    `;

    db.query(getUnassignedTicketsQuery, (err, tickets) => {
        if (err) {
            console.error('Error fetching unassigned tickets:', err);
            return;
        }

        tickets.forEach(ticket => {
            
            const findTechnicianQuery = `SELECT 
                u.id, u.email
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
                LEFT JOIN
                    user_details ud3
                    ON u.id = ud3.user_id
                    AND ud3.details_key = 'availability'
                WHERE 
                    u.role = 'technician'
                    AND u.is_active = 1
                    AND (ud3.details_value = 'available' OR ud3.details_value IS NULL)
                ORDER BY 
                    t.open_tickets ASC,
                    COALESCE(ud2.details_value, '1970-01-01') ASC
                LIMIT 1;
            `;

            db.query(findTechnicianQuery, [ticket.category_name], (err, technicians) => {
                if (err || technicians.length === 0) {
                    return;
                }

                const technician_id = technicians[0].id;
                const technicianEmail = technicians[0].email;

                const updateTicketQuery = `
                    UPDATE ticket 
                    SET assigned_to = ?, ticket_status = 'In-Progress', updated_at = NOW() 
                    WHERE id = ?
                `;

                db.query(updateTicketQuery, [technician_id, ticket.id], (err) => {
                    if (err) {
                        console.error(`Error assigning ticket ${ticket.id}:`, err);
                        return;
                    }

                    const updateLastAssignedQuery = `
                        INSERT INTO user_details (user_id, details_key, details_value)
                        VALUES (?, 'last_assigned_at', NOW())
                        ON DUPLICATE KEY UPDATE details_value = NOW();
                    `;

                    db.query(updateLastAssignedQuery, [technician_id], (err) => {
                        if (err) {
                            console.error('Error updating last_assigned_at:', err);
                        }
                        
                        console.log(`Ticket ${ticket.id} assigned to technician ${technician_id}`);
                        
                        const getUserEmailQuery = `SELECT email FROM users WHERE id = ?`;
                        
                        db.query(getUserEmailQuery, [ticket.user_id], (err, userResults) => {
                            if (err) {
                                console.error('Error fetching user email:', err);
                                return;
                            }
                            
                            const userEmail = userResults.length > 0 ? userResults[0].email : null;
                            
                           
                            if (technicianEmail) {
                                const technicianMailSubject = 'New Ticket Assigned';
                                const technicianMailContent = `
                                    <h2>New Ticket Assigned</h2>
                                    <p>A new ticket has been assigned to you:</p>
                                    <ul>
                                        <li><strong>Ticket ID:</strong> ${ticket.id}</li>
                                        <li><strong>Title:</strong> ${ticket.title}</li>
                                        <li><strong>Category:</strong> ${ticket.category_name}</li>
                                        <li><strong>Room Number:</strong> ${ticket.roomNumber}</li>
                                        <li><strong>Description:</strong> ${ticket.description}</li>
                                    </ul>
                                    <p>Please login to the system to view more details and take action.</p>
                                `;
                                
                                sendMail(technicianEmail, technicianMailSubject, technicianMailContent);
                            }
                            
                           
                            if (userEmail) {
                                const userMailSubject = 'Ticket Status Update';
                                const userMailContent = `
                                    <h2>Your Ticket Has Been Assigned</h2>
                                    <p>Your ticket has been assigned to a technician and is now in progress:</p>
                                    <ul>
                                        <li><strong>Ticket ID:</strong> ${ticket.id}</li>
                                        <li><strong>Title:</strong> ${ticket.title}</li>
                                        <li><strong>Status:</strong> In-Progress</li>
                                    </ul>
                                    <p>A technician will look into your issue shortly.</p>
                                `;
                                
                                sendMail(userEmail, userMailSubject, userMailContent);
                            }
                        });
                    });
                });
            });
        });
    });
};

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

        if (ticket.ticket_status === 'Closed') {
            return res.status(400).json({ error: 'Ticket is already closed and cannot be modified.' });
        }

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
                            verification_code: verificationCode 
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

module.exports = {createTicket,updateTicketStatus,verifyTicket,getAllTickets, getTicketbyId,getTicketsByUser,processTicketQueue};