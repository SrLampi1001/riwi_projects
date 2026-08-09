const multer = require('multer');
//This storage is made for convention, with file upload from html via fecth in mind
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), //folder for uploading the csv
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) //Naming convention
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true);
    } else {
        cb(new Error('Only .csv files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;