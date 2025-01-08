const express = require('express');
const router = express.Router();
const {register, login, logout, verifyMail, saveUserDetails} = require('../controllers/auth');

router.post('/register', register);
router.post('/register/saveUserDetails', saveUserDetails);
router.post('/register/verify', verifyMail);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;