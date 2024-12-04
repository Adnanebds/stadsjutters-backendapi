const express = require('express');
const router = express.Router();
const db = require('../server');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
router.post('/spot', upload.single('photo'), async (req, res) => {
    const { title, description, latitude, longitude, status, expiryDate, category, userId } = req.body;
    const photoUrl = req.file ? req.file.filename : null;
  
    try {
      const query = `
        INSERT INTO material (title, Photo, Description, Latitude, Longitude, Status, CreatedAt, ExpiryDate, UserID, category)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, ?, ?)
      `;
      
      const [result] = await db.query(query, [title, photoUrl, description, latitude, longitude, status, expiryDate, userId, category]);
  
      res.status(201).json({ message: 'Spot created successfully', materialId: result.insertId });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
    }
  });
  

router.get('/spot', async (req, res) => {
    const query = 'SELECT * FROM material';
    try {
      const [results] = await db.query(query);
      const processedResults = results.map(item => ({
        ...item,
        Photo: item.Photo ? `${req.protocol}://${req.get('host')}/uploads/${item.Photo}` : null
      }));
      res.json(processedResults);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

router.get('/category', async (req, res) => {
    try {
        const [rows] = await db.query('SHOW COLUMNS FROM material LIKE "category"');
        const enumValues = rows[0].Type.match(/enum\((.*)\)/)[1].split(',').map(value => value.replace(/'/g, ''));
        res.json(enumValues);
    } catch (error) {
        console.error('Error fetching enum values:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;