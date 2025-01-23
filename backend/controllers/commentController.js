const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');
//comment 
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
        return res.status(201).json({
            message: 'Comment added successfully.',
            comment_id: result.insertId
        });
    });
};
// 2. Edit a Comment (PUT)
const editComment= (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id; 

    if (!content) {
        return res.status(400).json({ error: 'Updated comment content is required.' });
    }

    // Update the comment only if the user owns the comment
    const query = `UPDATE comment SET content = ? WHERE id = ? AND user_id = ?`;

    db.query(query, [content, id, user_id], (err, result) => {
        if (err) {
            console.error('Error updating comment:', err);
            return res.status(500).json({ error: 'Database error while updating comment.' });
        }

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: 'You can only edit your own comments or comment not found.' });
        }

        return res.status(200).json({
            message: 'Comment updated successfully.'
        });
    });
};

// 3. Delete a Comment (DELETE)
const deleteComment= (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id; 

    // Delete comment only if the user owns the comment
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

// 4. Get All Comments for a Ticket (GET)
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