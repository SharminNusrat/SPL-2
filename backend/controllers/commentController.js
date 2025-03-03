const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');
const sendMail = require('../utils/sendMail');

const addComment = (req, res) => {
    const { ticket_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id; 

    if (!content) {
        return res.status(400).json({ error: 'Comment content is required.' });
    }

    const query = `INSERT INTO comment (user_id, ticket_id, content, created_at) VALUES (?, ?, ?, NOW())`;

    db.query(query, [user_id, ticket_id, content], (err, result) => {
        if (err) {
            console.error('Error adding comment:', err);
            return res.status(500).json({ error: 'Database error while adding comment.' });
        }

        const commentId = result.insertId;

        // Fetch Ticket Creator and Assigned Technician
        const ticketQuery = `SELECT user_id, assigned_to FROM ticket WHERE id = ?`;
        db.query(ticketQuery, [ticket_id], (ticketErr, ticketResult) => {
            if (ticketErr || ticketResult.length === 0) {
                console.error('Error fetching ticket details:', ticketErr);
                return res.status(500).json({ error: 'Failed to fetch ticket details.' });
            }

            const { user_id: creator_id, assigned_to: technician_id } = ticketResult[0];
            let recipient_id = user_id === creator_id ? technician_id : creator_id;

            if (!recipient_id) {
                return res.status(201).json({ 
                    message: 'Comment added successfully, but no notification sent.', 
                    comment_id: commentId 
                });
            }

            // Fetch recipient email
            const emailQuery = `SELECT email FROM users WHERE id = ?`;
            db.query(emailQuery, [recipient_id], (emailErr, emailResult) => {
                if (emailErr || emailResult.length === 0) {
                    console.error('Error fetching recipient email:', emailErr);
                    return res.status(201).json({ 
                        message: 'Comment added successfully, but recipient email not found.', 
                        comment_id: commentId 
                    });
                }

                const recipientEmail = emailResult[0].email;
                const subject = `New Comment on Ticket #${ticket_id}`;
                const emailContent = `
                    <p>A new comment has been added on ticket #${ticket_id}.</p>
                    <p><strong>Comment:</strong> ${content}</p>
                `;

                sendMail(recipientEmail, subject, emailContent)
                    .then(() => {
                        return res.status(201).json({ 
                            message: 'Comment added successfully. Notification email sent.', 
                            comment_id: commentId 
                        });
                    })
                    .catch((mailErr) => {
                        console.error('Error sending email:', mailErr);
                        return res.status(201).json({ 
                            message: 'Comment added successfully, but email notification failed.', 
                            comment_id: commentId 
                        });
                    });
            });
        });
    });
};

const editComment = (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id; 

    if (!content) {
        return res.status(400).json({ error: 'Updated comment content is required.' });
    }

    const query = `UPDATE comment SET content = ? WHERE id = ? AND user_id = ?`;

    db.query(query, [content, id, user_id], (err, result) => {
        if (err) {
            console.error('Error updating comment:', err);
            return res.status(500).json({ error: 'Database error while updating comment.' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: 'You can only edit your own comments or comment not found.' });
        }

        // Fetch ticket_id from comment
        const commentQuery = `SELECT ticket_id FROM comment WHERE id = ?`;
        db.query(commentQuery, [id], (commentErr, commentResult) => {
            if (commentErr || commentResult.length === 0) {
                console.error('Error fetching comment details:', commentErr);
                return res.status(500).json({ error: 'Failed to fetch comment details.' });
            }

            const ticket_id = commentResult[0].ticket_id;

            // Fetch Ticket Creator and Assigned Technician
            const ticketQuery = `SELECT user_id, assigned_to FROM ticket WHERE id = ?`;
            db.query(ticketQuery, [ticket_id], (ticketErr, ticketResult) => {
                if (ticketErr || ticketResult.length === 0) {
                    console.error('Error fetching ticket details:', ticketErr);
                    return res.status(500).json({ error: 'Failed to fetch ticket details.' });
                }

                const { user_id: creator_id, assigned_to: technician_id } = ticketResult[0];
                let recipient_id = user_id === creator_id ? technician_id : creator_id;

                if (!recipient_id) {
                    return res.status(200).json({ 
                        message: 'Comment updated successfully, but no notification sent.' 
                    });
                }

                // Fetch recipient email
                const emailQuery = `SELECT email FROM users WHERE id = ?`;
                db.query(emailQuery, [recipient_id], (emailErr, emailResult) => {
                    if (emailErr || emailResult.length === 0) {
                        console.error('Error fetching recipient email:', emailErr);
                        return res.status(200).json({ 
                            message: 'Comment updated successfully, but recipient email not found.' 
                        });
                    }

                    const recipientEmail = emailResult[0].email;
                    const subject = `Comment Edited on Ticket #${ticket_id}`;
                    const emailContent = `
                        <p>A comment on ticket #${ticket_id} has been updated.</p>
                        <p><strong>Updated Comment:</strong> ${content}</p>
                    `;

                    sendMail(recipientEmail, subject, emailContent)
                        .then(() => {
                            return res.status(200).json({ 
                                message: 'Comment updated successfully. Notification email sent.' 
                            });
                        })
                        .catch((mailErr) => {
                            console.error('Error sending email:', mailErr);
                            return res.status(200).json({ 
                                message: 'Comment updated successfully, but email notification failed.' 
                            });
                        });
                });
            });
        });
    });
};


const deleteComment= (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id; 

    const query = `DELETE FROM comment WHERE id = ? AND user_id = ?`;

    db.query(query, [id, user_id], (err, result) => {
        if (err) {
            console.error('Error deleting comment:', err);
            return res.status(500).json({ error: 'Database error while deleting comment.' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: 'You can only delete your own comments or comment not found.' });
        }

        return res.status(200).json({
            message: 'Comment deleted successfully.'
        });
    });
};

const getAllCommentOnATicket= (req, res) => {
    const { ticket_id } = req.params;

    const query = `
        SELECT c.id, c.content, c.created_at, u.fname AS author
        FROM comment c
        JOIN users u ON c.user_id = u.id
        WHERE c.ticket_id = ?
        ORDER BY c.created_at ASC
    `;

    db.query(query, [ticket_id], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Database error while fetching comments.' });
        }

        return res.status(200).json({
            comments: results
        });
    });
};
module.exports = {addComment,editComment,deleteComment,getAllCommentOnATicket };