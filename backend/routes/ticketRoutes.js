const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import the middleware

const {
    createTicket,
    updateTicketStatus,
    verifyTicket,
    getAllTickets,
    getTicketbyId,
    addCategory,
    updateExistingCategory,
    deleteCategory,
    getAllCategory,
    addComment,
    editComment,
    deleteComment,
    getAllCommentOnATicket,
    upload,
    uploadFile,
    deleteFile,
    getAllFiles,
} = require('../controllers/ticketController.js');

// Protected routes
router.post('/', authenticateToken, createTicket);
router.get('/tickets', authenticateToken, getAllTickets);
router.get('/tickets/:id', authenticateToken,getTicketbyId);
router.put('/:id/status', authenticateToken, updateTicketStatus);
//router.delete('/:id', authenticateToken, deleteTicket);
router.post('/:id/verify', authenticateToken, verifyTicket);

router.post('/categories', authenticateToken,addCategory);
router.put('/categories/:id', authenticateToken,updateExistingCategory);
router.delete('/categories/:id', authenticateToken,deleteCategory);
router.get('/categories', authenticateToken,getAllCategory);

router.post('/tickets/:ticket_id/comments', authenticateToken,addComment);
router.put('/comments/:id', authenticateToken,editComment);
router.delete('/comments/:id', authenticateToken,deleteComment);
router.get('/tickets/:ticket_id/comments', authenticateToken,getAllCommentOnATicket);

router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
router.delete('/files/:id', authenticateToken,deleteFile);
router.get('/files/ticket/:ticket_id', authenticateToken,getAllFiles);
module.exports = router;
