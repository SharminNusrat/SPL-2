const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');

const generateVerificationToken = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
};

const verifyMail = (req, res) => {
    const {email, otp} = req.body;

    if(!email || !otp) {
        return res.json({
            status: 'error', 
            error: 'Please provide both email and OTP'
        });
    }

    const q = 'SELECT * FROM users WHERE email = ?';

    db.query(q, [email], (err, data) => {
        if(err) {
            console.log(err);
        }
        if(!data[0]) {
            return res.json({
                status: 'error', 
                error: 'Email not found'
            });
        }

        const user = data[0];
        if(user.verification_token === otp) {
            const q = 'UPDATE users SET is_verified = 1 WHERE email = ?';
            db.query(q, [email], (err, updatedData) => {
                if(err) {
                    console.log(err);
                }
                return res.json({
                    status: 'success',
                    success: 'Email verified successfully!'
                });
            });
        }
        else {
            const q = 'DELETE FROM users WHERE email = ?';
            db.query(q, [email], (err, result) => {
                if(err) {
                    console.log(err);
                    return res.status(500).json({
                        error: 'Failed to delete unverified user'
                    });
                }
                return res.status(400).json({
                    status: 'error',
                    error: 'Incorrect OTP!'
                });
            });
        }
    });
}

const register = (req, res) => {

    //Check if user exists
    const q = 'SELECT * FROM users WHERE email = ?';
    db.query(q, [req.body.email], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length) {
            return res.status(409).json('User already exists!');
        }

        //Create a new User
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        const q = 'INSERT INTO users (`fname`, `lname`, `phn_no`, `email`, `password`, `role`) VALUE (?)';

        const values = [req.body.fname, req.body.lname, req.body.phn_no, req.body.email, hashedPassword, req.body.role];

        db.query(q, [values], (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }

            let mailSubject = 'Email Verification OTP';
            const verificationToken = generateVerificationToken();
            let content = `Your OTP code is: ${verificationToken}`;
            sendMail(req.body.email, mailSubject, content);

            const q = 'UPDATE users SET verification_token=? WHERE email=?';
            db.query(q, [verificationToken, req.body.email], (err, result) => {
                if(err) {
                    return res.status(500).send({
                        message: err
                    });
                }
            });

            return res.json({ status: 'success', success: 'Please verify your email to confirm registration.' });
        })
    })
}

const login = (req, res) => {
    const q = 'SELECT * FROM users WHERE email = ?';

    db.query(q, [req.body.email], (err, data) => {
        if(err) {
            return res.status(500).json(err);
        }
        if(data.length === 0) {
            return res.status(404).json('User not found!');
        }

        const user = data[0];

        const checkPassword = bcrypt.compareSync(req.body.password, user.password);

        if(!checkPassword) {
            return res.status(400).json('Incorrect email or password!');
        }

        const id = user.id;
        const token = jwt.sign({id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log('Token : ' + token);
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
        };

        const {password, ...others} = user;
        res.cookie('accessToken', token, cookieOptions).status(200).json(others);
    });
}

const logout = (req, res) => {
    res.clearCookie('accessToken', {
        secure: true,
        sameSite: "none"
    }).status(200).json('User has been logged out!');
}

module.exports = { register, login, logout, verifyMail };