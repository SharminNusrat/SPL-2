const express = require('express');
const router = express.Router();
const {register, login, logout, verifyMail, saveUserDetails, generateRecoveryOTP, resetPassword} = require('../controllers/auth');

router.post('/register', register);
router.post('/register/saveUserDetails', saveUserDetails);
router.post('/register/verify', verifyMail);
router.post('/recoverPassword/generateOTP', generateRecoveryOTP);
router.post('/recoverPassword/resetPass', resetPassword);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;