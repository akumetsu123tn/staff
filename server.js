require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: 'LightningDegreeDB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Database connection pool
let pool;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('Connected to database');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

// Connect to database
connectDB();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Endpoints

// Get all manga
app.get('/api/manga', async (req, res) => {
    try {
        const result = await pool.request()
            .query(`
                SELECT m.*, 
                    STRING_AGG(t.Name, ', ') as Tags
                FROM Manga m
                LEFT JOIN MangaTags mt ON m.MangaID = mt.MangaID
                LEFT JOIN Tags t ON mt.TagID = t.TagID
                GROUP BY m.MangaID, m.Title, m.Description, m.CoverImageURL, 
                         m.Status, m.Rating, m.TotalViews, m.CreatedAt, m.UpdatedAt
                ORDER BY m.TotalViews DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get manga by ID
app.get('/api/manga/:id', async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT m.*, 
                    STRING_AGG(t.Name, ', ') as Tags
                FROM Manga m
                LEFT JOIN MangaTags mt ON m.MangaID = mt.MangaID
                LEFT JOIN Tags t ON mt.TagID = t.TagID
                WHERE m.MangaID = @id
                GROUP BY m.MangaID, m.Title, m.Description, m.CoverImageURL, 
                         m.Status, m.Rating, m.TotalViews, m.CreatedAt, m.UpdatedAt
            `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Manga not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chapters for a manga
app.get('/api/manga/:id/chapters', async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT c.*, 
                    (SELECT COUNT(*) FROM ChapterImages WHERE ChapterID = c.ChapterID) as ImageCount
                FROM Chapters c
                WHERE c.MangaID = @id
                ORDER BY c.ChapterNumber DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chapter images
app.get('/api/chapters/:id/images', async (req, res) => {
    try {
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT ci.*
                FROM ChapterImages ci
                WHERE ci.ChapterID = @id
                ORDER BY ci.ImageOrder
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User authentication endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('passwordHash', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (Username, Email, PasswordHash)
                VALUES (@username, @email, @passwordHash);
                SELECT SCOPE_IDENTITY() as UserID;
            `);

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.recordset[0].UserID 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT UserID, Username, PasswordHash, Credits
                FROM Users
                WHERE Email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.PasswordHash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.UserID, username: user.Username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.UserID,
                username: user.Username,
                credits: user.Credits
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 