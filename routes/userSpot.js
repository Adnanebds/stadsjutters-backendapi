
router.post('/spot', async (req, res) => {
    const { title, photo, description, latitude, longitude, status, expiryDate, userId, category } = req.body;
  
    try {
      // Prepare the SQL query to insert into the 'material' table
      const query = `
        INSERT INTO material (title, Photo, Description, Latitude, Longitude, Status, CreatedAt, ExpiryDate, UserID, category)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, ?, ?)
      `;
      
      // Insert the values into the table
      const [result] = await db.query(query, [title, photo, description, latitude, longitude, status, expiryDate, userId, category]);
  
      // Send a success response
      res.status(201).json({ message: 'Spot aangemaakt', materialId: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


   // Get all users
   router.get('/spot', async (req, res) => {
    const query = 'SELECT * FROM material';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

  