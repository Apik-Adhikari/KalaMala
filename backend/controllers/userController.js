const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendVerificationEmail = async (email, code) => {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	});

	await transporter.sendMail({
		from: `"KalaMala" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: 'Your KalaMala Verification Code',
		html: `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 16px;">
			<h2 style="color: #1a1a2e; text-align: center;">Welcome to KalaMala!</h2>
			<p style="color: #555; text-align: center;">Use the code below to verify your email address:</p>
			<div style="background: #f0f0f0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
				<span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${code}</span>
			</div>
			<p style="color: #999; font-size: 13px; text-align: center;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
		</div>`
	});
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
	try {
		let { fullName, email, phone, password } = req.body;
		if (typeof phone === 'string') {
			phone = phone.trim();
		}

		// Check if user exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create user with 6-digit verification code
		const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
		const user = await User.create({
			fullName,
			email,
			phone,
			password,
			verificationToken: verificationCode
		});

		// Send verification email
		try {
			await sendVerificationEmail(user.email, verificationCode);
		} catch (emailError) {
			console.log("Nodemailer Error: ", emailError.message);
			await User.findByIdAndDelete(user._id);
			return res.status(500).json({
				message: 'Registration failed: Could not send verification email.'
			});
		}

		res.status(201).json({
			email: user.email,
			message: 'Registration successful! Please check your email for the verification code.'
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
			if (!user.isVerified) {
				return res.status(401).json({ message: 'Please verify your email before logging in.' });
			}
			// **STORE LOGIN DATA IN DATABASE**
			user.lastLogin = Date.now();
			await user.save();

			const token = generateToken(user._id);
			return res.json({
				_id: user._id,
				fullName: user.fullName,
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

const Seller = require('../models/Seller');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'Not authorized' });
		const user = await User.findById(userId).select('-password').populate('wishlist');
		
		if (user) {
			const seller = await Seller.findOne({ user: userId });
			const userData = user.toObject();
			userData.sellerStatus = seller ? seller.status : 'none';
			res.json(userData);
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

		user.fullName = req.body.fullName || user.fullName;
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
			fullName: updatedUser.fullName,
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

// @desc    Verify email with 6-digit code
// @route   POST /api/users/verify-code
// @access  Public
exports.verifyCode = async (req, res) => {
	try {
		const { email, code } = req.body;
		const user = await User.findOne({ email, verificationToken: code });

		if (!user) {
			return res.status(400).json({ message: 'Invalid verification code.' });
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

// @desc    Verify email via link (legacy support)
// @route   POST /api/users/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
	try {
		const { token } = req.body;
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
		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID
		});
		const { email, name, sub: googleId } = ticket.getPayload();

		let user = await User.findOne({ email });

		if (!user) {
			// New user via Google — create unverified and send verification code
			const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
			user = await User.create({
				fullName: name,
				email,
				phone: '+9770000000000',
				password: crypto.randomBytes(32).toString('hex'),
				googleId,
				isVerified: false,
				verificationToken: verificationCode
			});

			try {
				await sendVerificationEmail(user.email, verificationCode);
			} catch (emailError) {
				console.log("Nodemailer Error: ", emailError.message);
				await User.findByIdAndDelete(user._id);
				return res.status(500).json({
					message: 'Could not send verification email. Please try again later.'
				});
			}

			return res.status(201).json({
				email: user.email,
				message: 'Registration successful! Please check your email for the verification code.'
			});
		}

		// Existing user
		if (!user.isVerified) {
			return res.status(401).json({ message: 'Please verify your email before logging in.' });
		}

		user.googleId = googleId;
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

const sendPasswordResetEmail = async (email, resetToken) => {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	});

	const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

	await transporter.sendMail({
		from: `"KalaMala" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: 'KalaMala - Password Reset Request',
		html: `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 16px;">
			<h2 style="color: #1a1a2e; text-align: center;">Password Reset Request</h2>
			<p style="color: #555;">Hi,</p>
			<p style="color: #555;">We received a request to reset your password. Click the link below to create a new password:</p>
			<div style="text-align: center; margin: 30px 0;">
				<a href="${resetUrl}" style="background: #d64a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
			</div>
			<p style="color: #999; font-size: 13px;">This link expires in 30 minutes. If you didn't request a password reset, please ignore this email.</p>
			<p style="color: #999; font-size: 13px;">Or copy and paste this link: ${resetUrl}</p>
		</div>`
	});
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const normalizedEmail = email?.trim().toLowerCase();

		if (!normalizedEmail) {
			return res.status(400).json({ message: 'Please provide an email address' });
		}

		const user = await User.findOne({ email: normalizedEmail });
		if (!user) {
			return res.status(200).json({ 
				message: 'If an account exists with this email, a password reset link will be sent.' 
			});
		}

		const resetToken = crypto.randomBytes(32).toString('hex');
		const hashedResetToken = crypto
			.createHash('sha256')
			.update(resetToken)
			.digest('hex');

		await User.updateOne(
			{ _id: user._id },
			{
				$set: {
					passwordResetToken: hashedResetToken,
					passwordResetExpires: Date.now() + 30 * 60 * 1000
				}
			}
		);

		try {
			await sendPasswordResetEmail(user.email, resetToken);
		} catch (error) {
			await User.updateOne(
				{ _id: user._id },
				{
					$unset: {
						passwordResetToken: 1,
						passwordResetExpires: 1
					}
				}
			);
			return res.status(500).json({ 
				message: 'Error sending password reset email. Please try again later.' 
			});
		}

		res.status(200).json({ 
			message: 'Password reset link has been sent to your email address.' 
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
	try {
		const { token, password, passwordConfirm } = req.body;

		if (!token || !password || !passwordConfirm) {
			return res.status(400).json({ message: 'Please provide all required fields' });
		}

		if (password !== passwordConfirm) {
			return res.status(400).json({ message: 'Passwords do not match' });
		}

		if (password.length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters' });
		}

		const hashedToken = crypto
			.createHash('sha256')
			.update(token)
			.digest('hex');

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() }
		});

		if (!user) {
			return res.status(400).json({ message: 'Invalid or expired password reset token' });
		}

		user.password = password;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		res.status(200).json({ 
			message: 'Password has been reset successfully. Please log in with your new password.' 
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @desc    Verify reset token
// @route   GET /api/users/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res) => {
	try {
		const { token } = req.params;

		const hashedToken = crypto
			.createHash('sha256')
			.update(token)
			.digest('hex');

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() }
		});

		if (!user) {
			return res.status(400).json({ message: 'Invalid or expired password reset token' });
		}

		res.status(200).json({ 
			message: 'Token is valid',
			valid: true
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
