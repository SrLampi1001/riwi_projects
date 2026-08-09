const errorMiddleware = (error, req, res, next) => {
    if (error instanceof require('multer').MulterError) {
        return res.status(400).json({ message: `Multer Error: ${error.message}` });
    } else if (error) {
        // Custom error from fileFilter
        return res.status(400).json({ message: error.message });
    }
    next();
}
module.exports = errorMiddleware;