require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Changed here
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use('/uploads', express.static('uploads'));

let db; // Declare db outside to use it in async scope

// Database Connection - Wrap in an async function
async function initializeDatabase() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('✅ MySQL connected');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1); // Exit the process if the database connection fails
    }
}

initializeDatabase(); // Call the function

// File Upload Configuration
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed!'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('profilePic');

// Routes
app.post('/register', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { name, staffId, department, email } = req.body;
        const profilePicPath = `/uploads/${req.file.filename}`;

        if (!name || !staffId || !department || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const sql = 'INSERT INTO staff (name, staff_id, department, email, profile_pic) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [name, staffId, department, email, profilePicPath]);

        try {
            const qrCodeData = JSON.stringify({ staffId });
            const qrCodeImage = await QRCode.toDataURL(qrCodeData);
            res.json({ redirectUrl: `/success.html?name=${encodeURIComponent(name)}&qr=${encodeURIComponent(qrCodeImage)}` });
        } catch (error) {
            res.status(500).json({ message: 'QR Generation failed' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

app.post('/verify', async (req, res) => {  // Make sure this is async too
    try {
        const { staffId } = req.body;
        const sql = 'SELECT staff_id AS staffId, name, department, email FROM staff WHERE staff_id = ?';
    
        const [result] = await db.execute(sql, [staffId]);
        result.length > 0 
            ? res.json({ status: '✅ Verified', data: result[0] })
            : res.status(404).json({ error: '❌ Staff ID not found' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Database error', error: error.message });
    }
});

// Admin Dashboard Route
app.get('/admin/dashboard', async (req, res) => {  // Make sure this is async too
    try {
        console.log('Admin dashboard route hit'); // Debugging line
        const sql = 'SELECT id, name, email, department, staff_id, profile_pic FROM staff';
        const [results] = await db.execute(sql);
        console.log('Staff data:', results); // Debugging line
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to fetch staff data' });
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));
