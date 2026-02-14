const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
} = require('../controllers/orderController');

router.post('/', authMiddleware, addOrderItems);
router.get('/:id', authMiddleware, getOrderById);
router.get('/:id/verify', authMiddleware, updateOrderToPaid);

module.exports = router;
