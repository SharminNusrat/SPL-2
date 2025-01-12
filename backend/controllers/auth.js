const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const authenticateToken = require('../middleware/authMiddleware');

const generateVerificationToken = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
};

const saveUserDetails = (req, res) => {
    const { userId, roleData, role } = req.body;
    console.log(userId)

    if (!userId || !roleData || !role) {
        return res.status(400).json({
            status: 'error',
            error: 'User ID, role, and role-specific data are required'
        });
    }

    const q = 'INSERT INTO user_details (`user_id`, `details_key`, `details_value`) VALUES ?';

    const values = Object.entries(roleData).map(([key, value]) => [userId, key, value]);

    db.query(q, [values], (err, data) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                error: 'Failed to save data.'
            });
        }

        let mailSubject = 'Email Verification OTP';
        const verificationToken = generateVerificationToken();
        let content = `Your OTP code is: ${verificationToken}`;

        db.query('SELECT email FROM users WHERE id = ?', [userId], (err, data) => {
            if (err || data.length === 0) {
                return res.status(500).json({
                    status: 'error',
                    error: 'Failed to fetch user email.',
                });
            }

            const email = data[0].email;
            console.log(email)
            sendMail(email, mailSubject, content);

            const q = 'UPDATE users SET verification_token=? WHERE id=?';
            db.query(q, [verificationToken, userId], (err) => {
                if (err) {
                    return res.status(500).json({
                        status: 'error',
                        error: 'Failed to update verification token.'
                    });
                }

                return res.status(200).json({
                    status: 'success',
                    success: 'Data saved successfully! Please verify your email to confirm registration.'
                });
            });
        });
    });
};

const verifyMail = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.json({
            status: 'error',
            error: 'Please provide both email and OTP'
        });
    }

    const q = 'SELECT * FROM users WHERE email = ?';

    db.query(q, [email], (err, data) => {
        if (err) {
            console.log(err);
        }
        if (!data[0]) {
            return res.json({
                status: 'error',
                error: 'Email not found'
            });
        }

        const user = data[0];
        if (user.verification_token === otp) {
            const q = 'UPDATE users SET is_verified = 1, verification_token = NULL WHERE email = ?';
            db.query(q, [email], (err, updatedData) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        status: 'error',
                        error: 'Failed to update user data'
                    });
                }
                return res.json({
                    status: 'success',
                    success: 'Email verified successfully!'
                });
            });
        }

        else {
            return res.status(400).json({
                status: 'error',
                error: 'Incorrect OTP!'
            });
        }
        // else {
        //     const q = 'DELETE FROM users WHERE email = ?';
        //     db.query(q, [email], (err, result) => {
        //         if (err) {
        //             console.log(err);
        //             return res.status(500).json({
        //                 error: 'Failed to delete unverified user'
        //             });
        //         }
        //         return res.status(400).json({
        //             status: 'error',
        //             error: 'Incorrect OTP!'
        //         });
        //     });
        // }
    });
};

const generateRecoveryOTP = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            status: 'error',
            error: 'Email is required'
        });
    }

    const q = 'SELECT * FROM users WHERE email = ?';
    db.query(q, [email], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found!'
            });
        }

        const resetOTP = generateVerificationToken();
        const q = 'UPDATE users SET verification_token = ? WHERE email = ?';

        db.query(q, [resetOTP, email], (err) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    error: 'Failed to generate password reset token.',
                });
            }

            const mailSubject = 'Password Recovery OTP';
            const content = `Your password reset OTP is: ${resetOTP}`;
            sendMail(email, mailSubject, content);

            return res.status(200).json({
                status: 'success',
                success: 'Password reset OTP sent to your email.'
            });
        });
    });
};

const resetPassword = (req, res) => {
    const {email, otp, newPassword} = req.body;

    const q = 'SELECT * FROM users WHERE email = ?';
    db.query(q, [email], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found!',
            });
        }

        const user = data[0];
        if(user.verification_token !== otp) {
            return res.status(400).json({
                status: 'error',
                error: 'Invalid OTP',
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);
        console.log(hashedPassword);

        const q = 'UPDATE users SET password = ?, verification_token = NULL WHERE email = ?';

        db.query(q, [hashedPassword, email], (err) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    error: 'Failed to reset password.',
                });
            }

            return res.status(200).json({
                status: 'success',
                success: 'Password reset successfully'
            });
        });
    });
};

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

            //const userId = result.insertId;

            return res.json({ status: 'success', success: 'Data saved successfully!' });
        })
    })
};

// const login = (req, res) => {
//     const q = 'SELECT * FROM users WHERE email = ?';

//     db.query(q, [req.body.email], (err, data) => {
//         if(err) {
//             return res.status(500).json(err);
//         }
//         if(data.length === 0) {
//             return res.status(404).json('User not found!');
//         }

//         const user = data[0];

//         const checkPassword = bcrypt.compareSync(req.body.password, user.password);

//         if(!checkPassword) {
//             return res.status(400).json('Incorrect email or password!');
//         }

//         const id = user.id;
//         const token = jwt.sign({id}, process.env.JWT_SECRET, {
//             expiresIn: process.env.JWT_EXPIRES_IN
//         });

//         console.log('Token : ' + token);
//         const cookieOptions = {
//             expires: new Date(
//                 Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
//             ),
//             httpOnly: true
//         };

//         const {password, ...others} = user;
//         res.cookie('accessToken', token, cookieOptions).status(200).json(others);
//     });
// }

const login = (req, res) => {
    const q = 'SELECT * FROM users WHERE email = ?';

    db.query(q, [req.body.email], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length === 0) {
            return res.status(404).json('User not found!');
        }

        const user = data[0];

        const checkPassword = bcrypt.compareSync(req.body.password, user.password);

        if (!checkPassword) {
            return res.status(400).json('Incorrect email or password!');
        }

        // Generate token
        const id = user.id;
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default to 1 hour if not set
        });

        console.log('Generated Token:', token); // Debugging

        // Set token as a cookie
        const cookieOptions = {
            expires: new Date(
                Date.now() + (process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000 // Default 1 day
            ),
            httpOnly: true, // Secure cookie
        };

        // Send only `id` and `token` in the response
        res.cookie('accessToken', token, cookieOptions).status(200).json({
            id: user.id,
            token,
        });
    });
};

const logout = (req, res) => {
    res.clearCookie('accessToken', {
        secure: true,
        sameSite: "none"
    }).status(200).json('User has been logged out!');
};

module.exports = { register, login, logout, verifyMail, saveUserDetails, generateRecoveryOTP, resetPassword };