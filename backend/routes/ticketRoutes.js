const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import the middleware


const {
    createTicket,
    updateTicketStatus,
    verifyTicket,
    getAllTickets,
    getTicketbyId,
    getTicketsByUser
} = require('../controllers/ticketController.js');

const {
    addCategory,
    updateExistingCategory,
    deleteCategory,
    getAllCategory,
} = require('../controllers/categoryController.js');

const {
    addComment,
    editComment,
    deleteComment,
    getAllCommentOnATicket,
} = require('../controllers/commentController.js');

const {
    upload,
    uploadFile,
    deleteFile,
    getAllFiles,
} = require('../controllers/fileController.js');

const {
    technicianPerformance,
    categoryBasedReport,
} = require('../controllers/reportController.js');

// Protected routes
router.post('/ticket', authenticateToken, createTicket);
router.get('/tickets', authenticateToken, getAllTickets);
router.get('/tickets/:id', authenticateToken,getTicketbyId);
router.put('/:id/status', authenticateToken, updateTicketStatus);
//router.delete('/:id', authenticateToken, deleteTicket);
router.post('/:id/verify', authenticateToken, verifyTicket);
router.get('/tickets', authenticateToken, getTicketsByUser);

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

router.get('/report/technician-performance',authenticateToken,technicianPerformance);
router.get('/report/category-distribution',categoryBasedReport);
module.exports = router;
