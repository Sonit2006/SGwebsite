const express = require('express');
const cors = require('cors');

// Define your API endpoints here
// ...

const mysql = require('mysql2');

const app = express();
app.use(cors());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sonit@2006',
  database: 'nchs',
});

// Define an API endpoint for fetching data
app.get('/data', (req, res) => {
  // Acquire a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Execute a MySQL query
    connection.query('SELECT Name FROM nchs.track', (err, results) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Return the query results as JSON
      res.json(results);
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});