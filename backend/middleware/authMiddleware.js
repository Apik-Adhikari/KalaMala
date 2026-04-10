const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
	console.log('--- AUTH START ---');
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		console.log('--- AUTH FAIL: No Header ---');
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		console.log('--- AUTH FAIL: No Token in Header ---');
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-kalamala-123');
		console.log('--- AUTH: Token Verified for ID:', decoded.id);
		
		const user = await User.findById(decoded.id).select('-password');
		if (!user) {
			console.log('--- AUTH FAIL: User not found in DB ---');
			return res.status(401).json({ message: 'Not authorized, user not found' });
		}
		
		console.log('--- AUTH SUCCESS: User Found:', user.email, 'Role:', user.role);
		req.user = user; 
		next();
	} catch (err) {
		console.log('--- AUTH ERROR:', err.message);
		res.status(401).json({ message: 'Not authorized, invalid token' });
	}
}

function adminMiddleware(req, res, next) {
	console.log('--- ADMIN CHECK START ---');
	console.log('User Role:', req.user?.role);
	
	if (req.user && req.user.role === 'admin') {
		console.log('--- ADMIN CHECK SUCCESS ---');
		next();
	} else {
		console.log('--- ADMIN CHECK FAIL: Forbidden ---');
		res.status(403).json({ message: 'Not authorized as an admin' });
	}
}

module.exports = { authMiddleware, adminMiddleware };
