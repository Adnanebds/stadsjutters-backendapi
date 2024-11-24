const express = require('express');
const router = express.Router();
const db = require('../server'); // Ensure this imports the pool

const multer = require('multer');
const path = require('path');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid filename collisions
    }
});

const upload = multer({ storage: storage });

router.post('/spot', upload.single('photo'), async (req, res) => {
    console.log('Received data:', req.body);

    const { title, description, latitude, longitude, status, expiryDate, category, userId } = req.body;
    const photoPath = req.file ? req.file.path : null; // Store the path to the uploaded file

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const query = `
            INSERT INTO material (title, Photo, Description, Latitude, Longitude, Status, CreatedAt, ExpiryDate, UserID, category)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [title, photoPath, description, latitude, longitude, status, expiryDate, userId, category]);

        res.status(201).json({ message: 'Spot created successfully', materialId: result.insertId });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all spots
router.get('/spot', async (req, res) => {
    const query = 'SELECT * FROM material';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; // Export the router instance