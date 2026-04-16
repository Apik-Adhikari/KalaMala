const fs = require('fs');

const appendText = `
// @desc    Verify email address
// @route   POST /api/users/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
	try {
		const { token } = req.body;
		const User = require('../models/User');
		const generateToken = require('../utils/generateToken');
		const user = await User.findOne({ verificationToken: token });

		if (!user) {
			return res.status(400).json({ message: 'Invalid or expired verification token' });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		await user.save();

		const authToken = generateToken(user._id);

		res.json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			phone: user.phone,
			role: user.role,
			token: authToken,
			message: 'Email verified successfully!'
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Google auth
// @route   POST /api/users/google
// @access  Public
exports.googleAuth = async (req, res) => {
	try {
		const { token } = req.body;
		const User = require('../models/User');
		const generateToken = require('../utils/generateToken');
		const crypto = require('crypto');
		const { OAuth2Client } = require('google-auth-library');
		const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID
		});
		const { email, name, sub: googleId } = ticket.getPayload();

		let user = await User.findOne({ email });

		if (!user) {
			user = await User.create({
				fullName: name,
				email,
				phone: '+9770000000000',
				password: crypto.randomBytes(32).toString('hex'),
				googleId,
				isVerified: true
			});
		} else {
			user.googleId = googleId;
			user.isVerified = true;
			await user.save();
		}

		user.lastLogin = Date.now();
		await user.save();

		const authToken = generateToken(user._id);

		return res.json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			phone: user.phone,
			role: user.role,
			token: authToken,
		});
	} catch (error) {
		res.status(500).json({ message: 'Google Auth Failed: ' + error.message });
	}
};
`;

const f = fs.readFileSync('controllers/userController.js', 'utf8');
if (!f.includes('exports.verifyEmail =')) {
	fs.writeFileSync('controllers/userController.js', f + '\n' + appendText);
}
console.log("Appended successfully");
