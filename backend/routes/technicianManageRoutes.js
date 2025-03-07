const express = require('express');
const router = express.Router();
const {getAllTechnicians,getTechnicianById,deactivateTechnician,activateTechnician} = require('../controllers/technicianManageController.js');
//const authenticateToken = require('../middleware/authMiddleware');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware.js');

router.get('/', authenticateToken,isAdmin, getAllTechnicians);
router.get('/:id', authenticateToken,isAdmin, getTechnicianById);
router.put('/:id/deactivate', authenticateToken,isAdmin, deactivateTechnician);
router.put('/:id/activate', authenticateToken,isAdmin, activateTechnician);


module.exports = router;