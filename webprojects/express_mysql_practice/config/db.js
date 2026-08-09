const mysql = require('mysql2/promise'); // Import mysql2/promise for async/await support
require('dotenv').config(); // Load environment variables from .env file
// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.IP, // Database host from environment variable
    user: process.env.USER, // Database user from environment variable
    password: process.env.PASSWORD, // Database password from environment variable
    database: process.env.DB_NAME, // Database name from environment variable
    waitForConnections: true, // Wait for connections if the pool is full
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0 // Unlimited queueing for connection requests
});

module.exports = pool; // Export the connection pool for use in other modules