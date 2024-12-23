const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Debugging

    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted Token:', token); // Debugging

    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err); // Debugging
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        console.log('Token Verified Successfully:', user); // Debugging
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
