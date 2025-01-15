const express = require('express');
const router = express.Router();
const {register, login, logout, verifyMail, saveUserDetails, generateRecoveryOTP, resetPassword, getProfile, updateProfile} = require('../controllers/auth');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/register/saveUserDetails', saveUserDetails);
router.post('/register/verify', verifyMail);
router.post('/recoverPassword/generateOTP', generateRecoveryOTP);
router.post('/recoverPassword/resetPass', resetPassword);
router.post('/login', login);
router.post('/logout', logout);

// Authenticated routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile/update', authenticateToken, updateProfile);


module.exports = router;