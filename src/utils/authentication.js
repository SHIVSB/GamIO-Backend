const jwt = require('jsonwebtoken');
const User = require('../models/user/user');

const generateToken = id => jwt.sign({id}, process.env.JWT_KEY, {expiresIn: '10d'});

const authMiddleware = async (req, res, next) => {
	let token;

	if (req.headers.authorization.startsWith('Bearer')) {
		// Console.log(req.headers.authorization)
		try {
			token = req.headers.authorization.split(' ')[1];
			if (token) {
				const decoded = jwt.verify(token, process.env.JWT_KEY);
				// Find the user by id
				const user = await User.findById(decoded.id).select('-password');
				// Attach the user to req
				req.user = user;
				next();
			}
		} catch (error) {
			res.status(500).send('User not authorized');
		}
	} else {
		console.log('No authorization token');

		return res.status(500).send('No authorization token detected');
	}
};

module.exports = {generateToken, authMiddleware};
