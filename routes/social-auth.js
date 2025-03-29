const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        const users = await pool.query(
            'SELECT u.*, r.RoleName FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE Email = ?',
            [profile.emails[0].value]
        );

        if (users.rows.length > 0) {
            return done(null, users.rows[0]);
        }

        // Create new user
        const result = await pool.query(
            `INSERT INTO Users (Username, Email, EmailVerified, RoleID, GoogleID)
             VALUES (?, ?, true, 4, ?)
             RETURNING *`,
            [profile.displayName, profile.emails[0].value, profile.id]
        );

        return done(null, result.rows[0]);
    } catch (error) {
        return done(error, null);
    }
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        const users = await pool.query(
            'SELECT u.*, r.RoleName FROM Users u JOIN Roles r ON u.RoleID = r.RoleID WHERE Email = ?',
            [profile.emails[0].value]
        );

        if (users.rows.length > 0) {
            return done(null, users.rows[0]);
        }

        // Create new user
        const result = await pool.query(
            `INSERT INTO Users (Username, Email, EmailVerified, RoleID, FacebookID)
             VALUES (?, ?, true, 4, ?)
             RETURNING *`,
            [profile.displayName, profile.emails[0].value, profile.id]
        );

        return done(null, result.rows[0]);
    } catch (error) {
        return done(error, null);
    }
}));

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user.UserID, role: req.user.RoleName },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// Facebook OAuth routes
router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user.UserID, role: req.user.RoleName },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

module.exports = router; 