const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { auth } = require('../middleware/auth');
const { pool } = require('../config/database');

// Enable 2FA
router.post('/enable', auth, async (req, res) => {
    try {
        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `Lightning Degree (${req.user.email})`
        });

        // Save secret to database
        await pool.query(
            'UPDATE Users SET TwoFactorSecret = ? WHERE UserID = ?',
            [secret.base32, req.user.id]
        );

        // Generate QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            secret: secret.base32,
            qrCode
        });
    } catch (error) {
        console.error('2FA enable error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify and activate 2FA
router.post('/verify', auth, async (req, res) => {
    try {
        const { token } = req.body;

        // Get user's secret
        const users = await pool.query(
            'SELECT TwoFactorSecret FROM Users WHERE UserID = ?',
            [req.user.id]
        );

        const secret = users.rows[0].TwoFactorSecret;

        // Verify token
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Activate 2FA
        await pool.query(
            'UPDATE Users SET TwoFactorEnabled = true WHERE UserID = ?',
            [req.user.id]
        );

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify 2FA token during login
router.post('/validate', async (req, res) => {
    try {
        const { userId, token } = req.body;

        // Get user's secret
        const users = await pool.query(
            'SELECT TwoFactorSecret FROM Users WHERE UserID = ?',
            [userId]
        );

        const secret = users.rows[0].TwoFactorSecret;

        // Verify token
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1 // Allow 30 seconds clock skew
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        res.json({ message: '2FA validation successful' });
    } catch (error) {
        console.error('2FA validation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Disable 2FA
router.post('/disable', auth, async (req, res) => {
    try {
        const { token } = req.body;

        // Get user's secret
        const users = await pool.query(
            'SELECT TwoFactorSecret FROM Users WHERE UserID = ?',
            [req.user.id]
        );

        const secret = users.rows[0].TwoFactorSecret;

        // Verify token one last time
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Disable 2FA
        await pool.query(
            'UPDATE Users SET TwoFactorEnabled = false, TwoFactorSecret = NULL WHERE UserID = ?',
            [req.user.id]
        );

        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 