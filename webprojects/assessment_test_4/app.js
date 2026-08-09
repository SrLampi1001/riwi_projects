const express = require('express');
const errorMiddleware = require("./middleware/error.middleware")
const csvRoutes = require('./routes/csv.routes');

const app = express();

// Middleware
app.use(express.static('public'));

app.use('/normalizeCsv', csvRoutes); // All csv files go here

// Global Error Handler for Multer (optional but good practice)
app.use(errorMiddleware);

module.exports = app;
