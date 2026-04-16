const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

		if (!email) {
			return res.status(400).json({ message: 'Please provide an email address' });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			// Don't reveal if email exists for security
			return res.status(200).json({ 
				message: 'If an account exists with this email, a password reset link will be sent.' 
			});
		}

		// Generate reset token
		const resetToken = user.generatePasswordResetToken();
		await user.save({ validateBeforeSave: false });

		try {
			await sendPasswordResetEmail(user.email, resetToken);
		} catch (error) {
			user.passwordResetToken = undefined;
			user.passwordResetExpires = undefined;
			await user.save({ validateBeforeSave: false });
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

		// Hash the token to match stored token
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

		// Update password
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
