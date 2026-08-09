const csvService = require('../services/csv.service');

const uploadCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });  //Update pending: throw error and manage it with middleware.
    }
    try {
        const result = await csvService.uploadAndProcessCsv(req.file);
        res.status(200).json(result);   //Shows the result message on the enpoint
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ message: error.message || 'An internal server error occurred.' });
    }
};

module.exports = {
    uploadCsv
};