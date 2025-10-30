const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Username is required'],
		trim: true,
		minlength: 3,
		maxlength: 30
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
	// For future extensibility
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
	},
	profileImage: {
		type: String,
		default: ''
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

const User = mongoose.model('User', userSchema);
module.exports = User;
