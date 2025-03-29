const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const users = await pool.query(
            'SELECT u.*, r.RoleName FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE u.UserID = ?',
            [decoded.userId]
        );

        if (users.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = users.rows[0];

        // Check if email is verified
        if (!user.EmailVerified) {
            return res.status(401).json({ message: 'Please verify your email before accessing this resource' });
        }

        // Add user to request object
        req.user = {
            id: user.UserID,
            username: user.Username,
            email: user.Email,
            role: user.RoleName,
            credits: user.Credits
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        next();
    };
};

module.exports = { auth, authorize }; 