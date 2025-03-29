const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const { pool } = require('../config/database');

describe('Authentication Tests', () => {
    let testUser;
    let testToken;

    beforeAll(async () => {
        // Create test user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('TestP@ssw0rd', salt);
        
        const result = await pool.query(
            `INSERT INTO Users (Username, Email, PasswordHash, EmailVerified, RoleID)
             VALUES (?, ?, ?, true, 4)
             RETURNING *`,
            ['testuser', 'test@example.com', hashedPassword]
        );
        
        testUser = result.rows[0];
        testToken = jwt.sign(
            { userId: testUser.UserID, role: 'User' },
            process.env.JWT_SECRET
        );
    });

    afterAll(async () => {
        // Clean up test user
        await pool.query('DELETE FROM Users WHERE UserID = ?', [testUser.UserID]);
        await pool.end();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'new@example.com',
                    password: 'NewP@ssw0rd'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message');
        });

        it('should reject weak passwords', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'weakuser',
                    email: 'weak@example.com',
                    password: 'weak'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'TestP@ssw0rd'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should send reset link for valid email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'test@example.com'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message');
        });

        it('should handle non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'nonexistent@example.com'
                });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/2fa/enable', () => {
        it('should enable 2FA for authenticated user', async () => {
            const res = await request(app)
                .post('/api/2fa/enable')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('secret');
            expect(res.body).toHaveProperty('qrCode');
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/2fa/enable');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Protected Routes', () => {
        it('should access protected route with valid token', async () => {
            const res = await request(app)
                .get('/api/protected-route')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toBe(200);
        });

        it('should reject invalid token', async () => {
            const res = await request(app)
                .get('/api/protected-route')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Social Login', () => {
        it('should redirect to Google OAuth', async () => {
            const res = await request(app)
                .get('/api/auth/google');

            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain('accounts.google.com');
        });

        it('should redirect to Facebook OAuth', async () => {
            const res = await request(app)
                .get('/api/auth/facebook');

            expect(res.statusCode).toBe(302);
            expect(res.header.location).toContain('facebook.com');
        });
    });
});

describe('Password Validation', () => {
    const validatePassword = require('../utils/password-validation');

    it('should validate strong passwords', () => {
        const result = validatePassword('StrongP@ssw0rd');
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe(5);
    });

    it('should reject weak passwords', () => {
        const result = validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.strength).toBeLessThan(4);
    });
}); 