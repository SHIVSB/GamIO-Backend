// Not found error

const notFound = (req, res, next) => {
	const error = new Error(`Not found - ${req.originalUrl}`);

	res.status(404);

	next(error);
};

// Error handler pass in 4 args
const errorHandler = (error, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

	res.status(statusCode);

	res.json({
		msg: error.message,
		stack: process.env.NODE_ENV === 'production' ? null : error.stack, // Which line of code has error
	});
};

module.exports = {errorHandler, notFound};
