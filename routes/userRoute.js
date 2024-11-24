    const express = require('express');
    const router = express.Router();
    const db = require('../server'); // Import the database connection
    const bcrypt = require('bcryptjs' );

    // Create a new user
    router.post('/users', async (req, res) => {
        const { Name, Email, Password, Role, Bio } = req.body;
      
        try {
          // Hash the password before saving
          const hashedPassword = await bcrypt.hash(Password, 10); // Hash with a salt rounds of 10
      
          const query = 'INSERT INTO user (Name, Email, Password, Role, Bio) VALUES (?, ?, ?, ?, ?)';
          const [result] = await db.query(query, [Name, Email, hashedPassword, Role, Bio]);
          res.status(201).json({ message: 'User created', userId: result.insertId });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

    // Get all users
    router.get('/users', async (req, res) => {
    const query = 'SELECT * FROM user';
    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    // Get a single user by ID
    router.get('/users/:id', async (req, res) => {
    const query = 'SELECT * FROM user WHERE UserID = ?';
    try {
        const [results] = await db.query(query, [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    // Update a user
    router.put('/users/:id', async (req, res) => {
    const { Name, Email, Password, Role, Bio } = req.body;
    const query = 'UPDATE user SET Name = ?, Email = ?, Password = ?, Role = ?, Bio = ? WHERE UserID = ?';
    try {
        const [result] = await db.query(query, [Name, Email, Password, Role, Bio, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    // Delete a user
    router.delete('/users/:id', async (req, res) => {
    const query = 'DELETE FROM user WHERE UserID = ?';
    try {
        const [result] = await db.query(query, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

    // Login route
router.post('/login', async (req, res) => {
    const { Email, Password } = req.body;
  
    // Query the database to find the user by email
    const query = 'SELECT * FROM user WHERE Email = ?';
    try {
      const [results] = await db.query(query, [Email]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const user = results[0];
  
      // Compare the hashed password with the provided password
      const isMatch = await bcrypt.compare(Password, user.Password);
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // If login is successful, return a success message
      res.json({ message: 'Login successful', userId: user.UserID, Name: user.Name, Role: user.Role });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

    module.exports = router;  // Export the router instance