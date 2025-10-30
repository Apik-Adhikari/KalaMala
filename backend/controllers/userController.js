const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
	try {

			let { username, email, phone, password } = req.body;
			if (typeof phone === 'string') {
				phone = phone.trim();
			}

		// Check if user exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create user
		const user = await User.create({
			username,
			email,
			phone,
			password
		});

		// Generate a token so user is logged in after registration
		const token = generateToken(user._id);

		res.status(201).json({
			_id: user._id,
			username: user.username,
			email: user.email,
			phone: user.phone,
			token,
			message: 'Registration successful'
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Login user and get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (user && (await user.matchPassword(password))) {
			const token = generateToken(user._id);
			return res.json({
				_id: user._id,
				username: user.username,
				email: user.email,
				phone: user.phone,
				token,
			});
		} else {
			return res.status(401).json({ message: 'Invalid email or password' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'Not authorized' });
		const user = await User.findById(userId).select('-password');
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'Not authorized' });
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: 'User not found' });

		user.username = req.body.username || user.username;
		user.email = req.body.email || user.email;
		user.phone = req.body.phone || user.phone;
		if (req.body.password) user.password = req.body.password;

		const updatedUser = await user.save();
		res.json({
			_id: updatedUser._id,
			username: updatedUser.username,
			email: updatedUser.email,
			phone: updatedUser.phone,
			token: generateToken(updatedUser._id),
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
