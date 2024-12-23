const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import the middleware

const {
    createTicket,
    updateTicketStatus,
    verifyTicket,
    getAllTickets,
    getTicketbyId,
} = require('../controllers/ticketController.js');

// Protected routes
router.post('/', authenticateToken, createTicket);
router.get('/tickets', authenticateToken, getAllTickets);
router.get('/tickets/:id', authenticateToken,getTicketbyId);
router.put('/:id/status', authenticateToken, updateTicketStatus);
//router.delete('/:id', authenticateToken, deleteTicket);
router.post('/:id/verify', authenticateToken, verifyTicket);

module.exports = router;
