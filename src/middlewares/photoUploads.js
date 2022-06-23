const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const multerStorage = multer.memoryStorage(); // Store image in the memory of our server

// file type

const multerFilter = (req, file, cb) => {
	// Checking file type

	if (file.mimetype.startsWith('image')) {
		cb(null, true); // Passing null first means it was successfull
	} else {
		// Rejected files
		cb(
			{
				message: 'Unsupported file',
			},
			false,
		);
	}
};

const photoUpload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	limits: {fileSize: 1000000},
});

const profilePhotoSize = async (req, res, next) => {
	// Check if there is no file

	if (!req.file) {
		return next();
	}

	req.file.filename = `user-${Date.now()} - ${req.file.originalname}`;

	await sharp(req.file.buffer)
		.resize(250, 250)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(path.join(`public/images/profile/${req.file.filename}`)); // Address of the ile to be stored

	// console.log("Resizing : ", req.file);
	next();
};

// Post image resizing

const postImgResize = async (req, res, next) => {
	// Check if there is no file

	if (!req.file) {
		return next();
	}

	req.file.filename = `user-${Date.now()} - ${req.file.originalname}`;

	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(path.join(`public/images/posts/${req.file.filename}`)); // Address of the file to be stored

	// console.log("Resizing : ", req.file);
	next();
};

// Create a folder where we want to store our images temporarily

module.exports = {photoUpload, profilePhotoSize, postImgResize};
