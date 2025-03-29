const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM Users WHERE Email = ? OR Username = ?',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert new user
        const result = await pool.query(
            `INSERT INTO Users (Username, Email, PasswordHash, EmailVerificationToken, EmailVerificationExpires, RoleID)
             VALUES (?, ?, ?, ?, ?, 4)`,
            [username, email, hashedPassword, verificationToken, verificationExpires]
        );

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Verify your email',
            html: `
                <h1>Welcome to Lightning Degree!</h1>
                <p>Please click the link below to verify your email:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
                <p>This link will expire in 24 hours.</p>
            `
        });

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        // Get user
        const users = await pool.query(
            'SELECT u.*, r.RoleName FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE u.Email = ?',
            [email]
        );

        if (users.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users.rows[0];

        // Check if email is verified
        if (!user.EmailVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.UserID, role: user.RoleName },
            process.env.JWT_SECRET,
            { expiresIn: remember ? '7d' : '24h' }
        );

        // Update last login
        await pool.query(
            'UPDATE Users SET LastLogin = GETDATE() WHERE UserID = ?',
            [user.UserID]
        );

        res.json({
            token,
            user: {
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                role: user.RoleName,
                credits: user.Credits
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Get user
        const users = await pool.query(
            'SELECT * FROM Users WHERE Email = ?',
            [email]
        );

        if (users.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users.rows[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        // Save reset token
        await pool.query(
            'UPDATE Users SET ResetToken = ?, ResetTokenExpires = ? WHERE UserID = ?',
            [resetToken, resetExpires, user.UserID]
        );

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?reset-token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Reset your password',
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { password, resetToken } = req.body;

        // Get user with valid reset token
        const users = await pool.query(
            'SELECT * FROM Users WHERE ResetToken = ? AND ResetTokenExpires > GETDATE()',
            [resetToken]
        );

        if (users.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const user = users.rows[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset token
        await pool.query(
            'UPDATE Users SET PasswordHash = ?, ResetToken = NULL, ResetTokenExpires = NULL WHERE UserID = ?',
            [hashedPassword, user.UserID]
        );

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify email endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        // Get user with valid verification token
        const users = await pool.query(
            'SELECT * FROM Users WHERE EmailVerificationToken = ? AND EmailVerificationExpires > GETDATE()',
            [token]
        );

        if (users.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        const user = users.rows[0];

        // Mark email as verified
        await pool.query(
            'UPDATE Users SET EmailVerified = 1, EmailVerificationToken = NULL, EmailVerificationExpires = NULL WHERE UserID = ?',
            [user.UserID]
        );

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Validate reset token endpoint
router.post('/validate-reset-token', async (req, res) => {
    try {
        const { token } = req.body;

        const users = await pool.query(
            'SELECT * FROM Users WHERE ResetToken = ? AND ResetTokenExpires > GETDATE()',
            [token]
        );

        if (users.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        res.json({ message: 'Valid reset token' });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Social login endpoints
router.get('/google', (req, res) => {
    // Implement Google OAuth flow
});

router.get('/facebook', (req, res) => {
    // Implement Facebook OAuth flow
});

module.exports = router; 