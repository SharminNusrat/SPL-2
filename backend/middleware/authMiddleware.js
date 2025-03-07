const jwt = require('jsonwebtoken');
const db = require('../db-config');
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); 

    const token = authHeader && authHeader.split(' ')[1];
    console.log('Extracted Token:', token); 

    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        console.log('Token Verified Successfully:', user); 
        const q = 'SELECT is_active FROM users WHERE id = ?';
        db.query(q, [user.id], (err, result) => {
            if (err || result.length === 0) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (result[0].is_active === 0) {
                return res.status(403).json({ error: 'Your account has been deactivated!' });
            }
            req.user = user;
            next();
       });
    });
};

const isAdmin = (req, res, next) => {
    
    if (!req.user || !req.user.id) {
        console.error("No user ID in request", req.user);
        return res.status(403).json({ error: "Authentication error: User ID missing" });
    }
    
    const userId = req.user.id;
    console.log("Checking admin status for user ID:", userId);
    
    
    const q = 'SELECT role FROM users WHERE id = ?';
    db.query(q, [userId], (err, result) => {
        if (err) {
            console.error("Database error in isAdmin middleware:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (result.length === 0) {
            console.error("User not found in database:", userId);
            return res.status(404).json({ error: "User not found" });
        }
        
        console.log("User role from database:", result[0].role);
        
        
        if (result[0].role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        
        
        next();
    });
};
module.exports = {authenticateToken, isAdmin};
