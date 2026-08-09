module.exports = (err, req, res, next) => { //error handling middleware
    console.error(err); // Log the error for debugging purposes
    res.status(500).json(err.message || { message: 'Internal Server Error' }); // Send a generic error response
    //Not calling next() here because this is the end of the middleware chain for error handling
};
