const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
        }
        cb(null, true);
    }
});

const uploadFile = async (req, res) => {
    try {
        const { ticket_id } = req.body;
        const uploaded_at = new Date();
        const user_id = req.user.id; 

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;

        if (!ticket_id) {
            return res.status(400).json({ error: 'ticket_id is required.' });
        }
        
        const query = `
            INSERT INTO file (ticket_id, type, path, uploaded_at)
            VALUES (?, ?, ?, ?)
        `;

        db.query(query, [ticket_id, fileType, filePath, uploaded_at], (err, result) => {
            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).json({ error: 'Database error while uploading file.' });
            }

            return res.status(201).json({
                message: 'File uploaded successfully.',
                file_id: result.insertId,
                file_path: filePath
            });
        });
    } catch (error) {
        console.error('Error in uploadFile:', error.message);
        return res.status(500).json({ error: error.message });
    }
};

const fs = require('fs');

const deleteFile= (req, res) => {
    const { id } = req.params;

    const getPathQuery = `SELECT path FROM file WHERE id = ?`;

    db.query(getPathQuery, [id], (err, results) => {
        if (err) {
            console.error('Error fetching file path:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'File not found.' });
        }

        const filePath = results[0].path;

        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error deleting file from storage:', unlinkErr);
                return res.status(500).json({ error: 'Error deleting file from storage.' });
            }

            const deleteQuery = `DELETE FROM file WHERE id = ?`;

            db.query(deleteQuery, [id], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error deleting file record:', deleteErr);
                    return res.status(500).json({ error: 'Database error while deleting file.' });
                }

                return res.status(200).json({ message: 'File deleted successfully.' });
            });
        });
    });
}
const getAllFiles= (req, res) => {
    const { ticket_id } = req.params;

    const query = `
        SELECT id, type, path, uploaded_at 
        FROM file 
        WHERE ticket_id = ?
    `;

    db.query(query, [ticket_id], (err, results) => {
        if (err) {
            console.error('Error fetching files:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No files found for this ticket.' });
        }

        return res.status(200).json({ files: results });
    });
};
module.exports = {upload,uploadFile, deleteFile,getAllFiles};