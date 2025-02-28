const express = require('express');
const router = express.Router();
const {register, login, logout, verifyMail, generateRecoveryOTP, resetPassword, getUserById, getProfile, updateProfile, resendVerificationOTP} = require('../controllers/userController.js');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/register/verify', verifyMail);
router.post('/resendOTP', resendVerificationOTP);
router.post('/recoverPassword/generateOTP', generateRecoveryOTP);
router.post('/recoverPassword/resetPass', resetPassword);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user/:id', getUserById);

// Authenticated routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile/update', authenticateToken, updateProfile);


module.exports = router;