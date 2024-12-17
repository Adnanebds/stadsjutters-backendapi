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
          INSERT INTO material (title, Photo, Description, Latitude, Longitude, Status, CreatedAt, ExpiryDate, UserID, category, deleted)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, ?, ?, 0)
      `;
      
      const [result] = await db.query(query, [title, photoUrl, description, latitude, longitude, status, expiryDate, userId, category]);

      res.status(201).json({ message: 'Spot created successfully', materialId: result.insertId });
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
  }
});


  router.get('/spot', async (req, res) => {
    const query = 'SELECT * FROM material WHERE deleted = 0';
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


router.get('/spot/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM material WHERE MaterialID = ? AND deleted = 0';

  try {
      const [results] = await db.query(query, [id]);
      if (results.length > 0) {
          const spot = results[0];
          spot.Photo = spot.Photo ? `${req.protocol}://${req.get('host')}/uploads/${spot.Photo}` : null;
          res.json(spot);
      } else {
          res.status(404).json({ message: `No spot found with ID ${id} or it has been deleted.` });
      }
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
  }
});



router.delete('/spot/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const query = 'UPDATE material SET deleted = 1 WHERE MaterialID = ?';

      const [result] = await db.query(query, [id]);

      if (result.affectedRows > 0) {
          res.json({ message: `Spot with ID ${id} marked as deleted (status set to 1)` });
      } else {
          res.status(404).json({ error: `No spot found with ID ${id}` });
      }
  } catch (err) {
      console.error('Error updating spot status:', err);
      res.status(500).json({ error: 'Failed to delete the spot' });
  }
});

router.post('/mark-as-picked-up', async (req, res) => {
  const { materialId } = req.body;

  if (!materialId) {
    return res.status(400).json({ error: 'Material ID is required' });
  }

  try {
    const query = 'UPDATE material SET Status = "picked_up" WHERE MaterialID = ? AND deleted = 0';
    const [result] = await db.query(query, [materialId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Spot not found or already picked up' });
    }

    res.status(200).json({ message: 'Spot marked as picked up' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});




router.get('/spot/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Query to fetch spots created by the user with 'deleted = 0'
    const query = 'SELECT * FROM material WHERE UserID = ? AND deleted = 0';

    const [results] = await db.query(query, [userId]);

    if (results.length > 0) {
      // Map and update photo URLs before sending back
      const spots = results.map(spot => ({
        ...spot,
        Photo: spot.Photo ? `${req.protocol}://${req.get('host')}/uploads/${spot.Photo}` : null
      }));

      res.json(spots);
    } else {
      res.status(404).json({ message: 'No spots found for this user.' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;