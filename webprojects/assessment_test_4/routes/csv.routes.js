const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const csvController = require('../controllers/csv.controller');

// The route is clean and declarative
router.post('/', upload.single('csvFile'), csvController.uploadCsv);

module.exports = router;