const express = require('express');
const router = express.Router();
const { registerSeller } = require('../controllers/sellerController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/sellers/register
// @desc    Register as a seller
// @access  Private
router.post('/register', authMiddleware, registerSeller);

module.exports = router;
