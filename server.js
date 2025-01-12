const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Create a connection pool to the database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'circulocostadjutter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connect to the database and log success or error
pool.getConnection()
  .then(() => console.log('Connected to the MySQL database!'))
  .catch((err) => console.error('Error connecting to the database:', err.message));

// Export the connection pool for use in other files
module.exports = pool;

// Import routes after exporting the connection
const userRoutes = require('./routes/userRoute');
const userSpots = require('./routes/userSpot');
const chatRoute = require('./routes/chatRoute')
const postNotification = require('./routes/NotificationRoute')
const pushToken = require('./routes/pushToken')
// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Set server timeout
app.timeout = 120000; // 2 minutes

app.use('/api', userRoutes); // Use user routes
app.use('/api', userSpots);
app.use('/api', chatRoute); // Use spot routes
app.use('/api', postNotification);
app.use('/api', pushToken);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));