const jwt = require('jsonwebtoken');

function generateToken(id) {
	if (!process.env.JWT_SECRET) {
		console.warn('Warning: JWT_SECRET is not set in environment. Tokens will still be generated but should be configured for production.');
	}
	return jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
		expiresIn: '30d',
	});
}

module.exports = generateToken;
