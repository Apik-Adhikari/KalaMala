const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, getUserById, toggleWishlist, uploadProfileImage, getNotifications, markNotificationAsRead, verifyEmail, verifyCode, googleAuth, forgotPassword, resetPassword, verifyResetToken } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadImages');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/users/verify-email
// @desc    Verify email address (legacy link)
// @access  Public
router.post('/verify-email', verifyEmail);

// @route   POST /api/users/verify-code
// @desc    Verify email with 6-digit code
// @access  Public
router.post('/verify-code', verifyCode);

// @route   POST /api/users/google
// @desc    Google auth
// @access  Public
router.post('/google', googleAuth);

// @route   GET /api/users/profile
// @desc    Get logged in user profile
// @access  Private
router.get('/profile', authMiddleware, getUserProfile);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, updateUserProfile);

// @route   PUT /api/users/profile/image
// @desc    Upload profile image
// @access  Private
router.put('/profile/image', authMiddleware, upload.single('image'), uploadProfileImage);

// @route   POST /api/users/wishlist/:id
// @desc    Toggle wishlist item
// @access  Private
router.post('/wishlist/:id', authMiddleware, toggleWishlist);

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', authMiddleware, getNotifications);

// @route   PUT /api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id', authMiddleware, markNotificationAsRead);

// @route   POST /api/users/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/users/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   GET /api/users/verify-reset-token/:token
// @desc    Verify reset token
// @access  Public
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
