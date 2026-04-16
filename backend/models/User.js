const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	fullName: {
		type: String,
		required: [true, 'Full Name is required'],
		trim: true,
		minlength: 3,
		maxlength: 50
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		trim: true,
		lowercase: true,
		match: [/.+@.+\..+/, 'Please enter a valid email address']
	},
	phone: {
		type: String,
		required: [true, 'Phone number is required'],
		match: [/^\+977[0-9]{10}$/, 'Please enter a valid Nepali phone number (e.g. +9779812345678)']
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: 6
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	lastLogin: {
		type: Date
	},
	// For future extensibility
	role: {
		type: String,
		enum: ['user', 'admin', 'seller'],
		default: 'user'
	},
	profileImage: {
		type: String,
		default: ''
	},
	address: {
		street: { type: String, default: '' },
		city: { type: String, default: '' },
		province: { type: String, default: '' }
	},
	wishlist: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		}
	],
	isVerified: {
		type: Boolean,
		default: false
	},
	verificationToken: {
		type: String
	},
	googleId: {
		type: String
	},
	passwordResetToken: {
		type: String
	},
	passwordResetExpires: {
		type: Date
	}
});

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err);
	}
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
	const crypto = require('crypto');
	const resetToken = crypto.randomBytes(32).toString('hex');
	
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');
	
	this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
	
	return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
