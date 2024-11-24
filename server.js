const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'circulocostadjutter'
}).promise(); // Convert to promise-based connection immediately

// Connect to the database
connection.connect()
  .then(() => console.log('Connected to the MySQL database!'))
  .catch((err) => console.error('Error connecting to the database:', err.message));

// Export the connection promise for use in other files
module.exports = connection;

// Import routes after exporting the connection
const userRoutes = require('./routes/userRoute');

// Server setup
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use('/api', userRoutes);  // Use the routes