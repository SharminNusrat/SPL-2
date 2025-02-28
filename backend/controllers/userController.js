const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const authenticateToken = require('../middleware/authMiddleware');

const generateVerificationToken = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
};

const getUserById = (req, res) => {
    const userId = req.params.id;
    // console.log("Fetching user with ID:", userId);

    const q = 'SELECT fname, lname FROM users WHERE id = ?';
    db.query(q, [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                status: 'error',
                error: 'Database error'
            });
        }
        if (result.length === 0) {
            // console.log("User not found for ID:", userId);
            return res.status(404).json({
                status: 'error',
                error: 'User not found!'
            });
        }

        return res.json(result[0]);
    })
}

const getProfile = (req, res) => {
    console.log("hiiii");
    const userId = req.user.id;

    const q = 'SELECT id, fname, lname, phn_no, email FROM users WHERE id = ?';

    db.query(q, [userId], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                status: 'error',
                error: 'Failed to fetch user data'
            });
        }

        console.log(data);
        if (data.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found!'
            });
        }

        const user = data[0];
        const q = 'SELECT details_key, details_value FROM user_details WHERE user_id = ?';

        db.query(q, [userId], (err, roleData) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'error',
                    error: 'Failed to fetch role specific data'
                });
            }

            const roleSpecificData = {};
            roleData.forEach((item) => {
                roleSpecificData[item.details_key] = item.details_value;
            });

            return res.status(200).json({
                status: 'success',
                profile: {
                    ...user,
                    roleData: roleSpecificData
                }
            });
        });
    });
};


const updateProfile = (req, res) => {

    const userId = req.user.id;
    const { fname, lname, phn_no, roleData } = req.body;

    const updateBasicInfo = () => {
        return new Promise((resolve, reject) => {

            const basicInfo = [];
            const basicValues = [];
            if (fname) {
                basicInfo.push('fname = ?');
                basicValues.push(fname);
            }
            if (lname) {
                basicInfo.push('lname = ?');
                basicValues.push(lname);
            }
            if (phn_no) {
                basicInfo.push('phn_no = ?');
                basicValues.push(phn_no);
            }

            const q = `UPDATE users SET ${basicInfo.join(', ')} WHERE id = ?`;
            basicValues.push(userId);

            db.query(q, basicValues, (err, data) => {
                if (err) {
                    return reject('Failed to update basic profile information');
                }
                resolve();
            });
        });
    };

    const updateSpecificInfo = () => {
        return new Promise((resolve, reject) => {
            const updateInfo = Object.entries(roleData).map(([key, value]) => {
                return new Promise((resolve, reject) => {
                    const q = `UPDATE user_details SET details_value = ? WHERE user_id = ? AND details_key = ?`;

                    db.query(q, [value, userId, key], (err, result) => {
                        if (err) {
                            console.error(`Error updating ${key}:`, err);
                            return reject(`Failed to update ${key}`);
                        }
                        resolve();
                    });
                });
            });

            Promise.all(updateInfo)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    };

    Promise.all([updateBasicInfo(), updateSpecificInfo()])
        .then(() => {
            return res.status(200).json({
                status: 'success',
                success: 'Profile updated successfully!'
            });
        })
        .catch((error) => {
            console.error('Profile update error:', error);
            return res.status(500).json({
                status: 'error',
                error
            });
        });
};

const verifyMail = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            status: 'error',
            error: 'Please provide both email and OTP'
        });
    }

    const q = 'SELECT * FROM users WHERE email = ?';

    db.query(q, [email], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }
        if (!data[0]) {
            return res.status(404).json({ status: 'error', error: 'Email not found' });
        }

        const user = data[0];

        if (user.verification_token === otp) {
            const q = 'UPDATE users SET is_verified = 1, verification_token = NULL WHERE email = ?';
            db.query(q, [email], (err, updatedData) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: 'error', error: 'Failed to update user data' });
                }

                // Generate token after successful verification
                const token = jwt.sign(
                    { id: user.id, role: user.role }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
                );

                res.cookie('accessToken', token, {
                    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                });

                return res.json({
                    status: 'success',
                    success: 'Email verified successfully!',
                    role: user.role,  // Pass role
                    token           // Pass token
                });
            });
        } else {
            return res.status(400).json({ status: 'error', error: 'Incorrect OTP!' });
        }
        
    });
};

const resendVerificationOTP = (req, res) => {
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
            return res.status(500).json({
                status: 'error',
                error: 'Database error'
            });
        }
        if (data.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'User not found!'
            });
        }

        const user = data[0];
        if (user.is_verified) {
            return res.status(400).json({
                status: 'error',
                error: 'User already verified!'
            });
        }

        const verificationToken = generateVerificationToken();
        const qUpdateUser = 'UPDATE users SET verification_token = ? WHERE email = ?';
        db.query(qUpdateUser, [verificationToken, email], (err) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    error: 'Failed to update verification token'
                });
            }

            const mailSubject = 'Resend Email Verification OTP';
            const content = `Your new OTP code is: ${verificationToken}`;
            sendMail(email, mailSubject, content);

            return res.status(200).json({
                status: 'success',
                success: 'Verification OTP resent successfully!'
            });
        });
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
    const { email, otp, newPassword } = req.body;

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
        if (user.verification_token !== otp) {
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

const register = async (req, res) => {
    const { fname, lname, email, phn_no, password, role, roleData } = req.body;

    if (!fname || !lname || !email || !phn_no || !password || !role) {
        return res.status(400).json({
            status: 'error',
            error: 'All fields are required!',
        });
    }

    const qCheck = 'SELECT * FROM users WHERE email = ?';
    db.query(qCheck, [email], (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length) {
            return res.status(409).json({ status: 'error', error: 'User already exists!' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const qInsertUser = 'INSERT INTO users (`fname`, `lname`, `phn_no`, `email`, `password`, `role`) VALUE (?)';
        const userValues = [fname, lname, phn_no, email, hashedPassword, role];

        db.query(qInsertUser, [userValues], (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            const userId = result.insertId;

            if (roleData && Object.keys(roleData).length > 0) {
                const qInsertRoleData = 'INSERT INTO user_details (`user_id`, `details_key`, `details_value`) VALUES ?';
                const roleDataValues = Object.entries(roleData).map(([key, value]) => [
                    userId,
                    key,
                    value,
                ]);

                db.query(qInsertRoleData, [roleDataValues], (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: 'error',
                            error: 'Failed to save role-specific data.',
                        });
                    }

                    const verificationToken = generateVerificationToken();
                    const qUpdateUser = 'UPDATE users SET verification_token = ? WHERE id = ?';

                    db.query(qUpdateUser, [verificationToken, userId], (err) => {
                        if (err) {
                            return res.status(500).json({
                                status: 'error',
                                error: 'Failed to save verification token.',
                            });
                        }

                        const mailSubject = 'Email Verification OTP';
                        const content = `Your OTP code is: ${verificationToken}`;
                        sendMail(email, mailSubject, content);

                        return res.status(200).json({
                            status: 'success',
                            success: 'User registered successfully! Please verify your email.',
                        });
                    });
                });
            }
            else {
                const verificationToken = generateVerificationToken();
                const qUpdateUser = 'UPDATE users SET verification_token = ? WHERE id = ?';

                db.query(qUpdateUser, [verificationToken, userId], (err) => {
                    if (err) {
                        return res.status(500).json({
                            status: 'error',
                            error: 'Failed to save verification token.',
                        });
                    }

                    const mailSubject = 'Email Verification OTP';
                    const content = `Your OTP code is: ${verificationToken}`;
                    sendMail(email, mailSubject, content);

                    return res.status(200).json({
                        status: 'success',
                        success: 'User registered successfully! Please verify your email.',
                    });
                });
            }
        });
    });
}

const login = (req, res) => {
    const q = 'SELECT * FROM users WHERE email = ?';

    db.query(q, [req.body.email], async (err, data) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (data.length === 0) {
            return res.status(404).json('User not found!');
        }

        const user = data[0];

        if (!user.is_verified) {
            const verificationToken = generateVerificationToken();

            const qUpdate = 'UPDATE users SET verification_token = ? WHERE email = ?';

            db.query(qUpdate, [verificationToken, user.email], (updateError) => {
                if (updateError) {
                    return res.status(500).json('Error updating verification code');
                }

                const mailSubject = 'Email Verification OTP';
                const content = `Your OTP code is: ${verificationToken}`;
                sendMail(user.email, mailSubject, content);

                return res.status(400).json('Your account is not verified. A new otp has been sent to your email. Please verify your account first.');
            });

            return;
        }

        const checkPassword = bcrypt.compareSync(req.body.password, user.password);

        if (!checkPassword) {
            return res.status(400).json('Incorrect email or password!');
        }
        console.log('User Role:', user.role);

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
            role: user.role,
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

module.exports = { register, login, logout, verifyMail, generateRecoveryOTP, resetPassword, getUserById, getProfile, updateProfile, resendVerificationOTP };