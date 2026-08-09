const mysql = require('mysql2/promise'); // Import mysql2/promise for async/await support
require('dotenv').config(); // Load environment variables from .env file
// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.MYSQL_DB_HOST, // Database host from environment variable
    user: process.env.MYSQL_DB_USER, // Database user from environment variable
    password: process.env.MYSQL_PASSWORD, // Database password from environment variable
    database: process.env.MYSQL_DB_NAME, // Database name from environment variable
    port: process.env.MYSQL_DB_PORT ?? 3306, //Database PORT, default 3306
    waitForConnections: true, // Wait for connections if the pool is full
    connectionLimit: 10, // Maximum number of connections in the pool
    queueLimit: 0 // Unlimited queueing for connection requests
});

module.exports = pool; // Export the connection pool for use in other modules