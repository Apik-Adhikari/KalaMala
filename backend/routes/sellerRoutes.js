const express = require('express');
const router = express.Router();
const { registerSeller, getSellerRequests, verifySeller } = require('../controllers/sellerController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadImages');

// @route   POST /api/sellers/register
// @desc    Register as a seller (Submit request)
// @access  Private
router.post('/register', authMiddleware, upload.single('documentPhoto'), registerSeller);

// @route   GET /api/sellers/requests
// @desc    Get all pending seller requests
// @access  Private/Admin
router.get('/requests', authMiddleware, adminMiddleware, getSellerRequests);

// @route   PUT /api/sellers/verify/:id
// @desc    Approve or Reject seller request
// @access  Private/Admin
router.put('/verify/:id', authMiddleware, adminMiddleware, verifySeller);

module.exports = router;
