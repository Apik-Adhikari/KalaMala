const User = require('../models/User');
const Notification = require('../models/Notification');

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
			role: user.role,
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
			// **STORE LOGIN DATA IN DATABASE**
			user.lastLogin = Date.now();
			await user.save();

			const token = generateToken(user._id);
			return res.json({
				_id: user._id,
				username: user.username,
				email: user.email,
				phone: user.phone,
				role: user.role,
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
		const user = await User.findById(userId).select('-password').populate('wishlist');
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');
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
		if (req.body.address) {
			user.address = {
				street: req.body.address.street || user.address.street,
				city: req.body.address.city || user.address.city,
				province: req.body.address.province || user.address.province,
			};
		}
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

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist/:id
// @access  Private
exports.toggleWishlist = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const productId = req.params.id;

		const index = user.wishlist.indexOf(productId);
		if (index > -1) {
			user.wishlist.splice(index, 1);
			await user.save();
			res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
		} else {
			user.wishlist.push(productId);
			await user.save();
			res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Upload profile image
// @route   PUT /api/users/profile/image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (req.file) {
			user.profileImage = req.file.path;
			await user.save();
			res.json({ message: 'Profile image updated', profileImage: user.profileImage });
		} else {
			res.status(400).json({ message: 'No image uploaded' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};




// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
		res.json(notifications);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id
// @access  Private
exports.markNotificationAsRead = async (req, res) => {
	try {
		const notification = await Notification.findById(req.params.id);
		if (notification) {
			notification.isRead = true;
			await notification.save();
			res.json({ message: 'Notification marked as read' });
		} else {
			res.status(404).json({ message: 'Notification not found' });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
