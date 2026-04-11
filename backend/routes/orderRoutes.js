const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getSalesTrends,
    getSellerStats,
    getMyOrders
} = require('../controllers/orderController');

router.post('/', authMiddleware, addOrderItems);
router.get('/myorders', authMiddleware, getMyOrders);
router.get('/sales-trends', authMiddleware, getSalesTrends);
router.get('/seller/stats', authMiddleware, getSellerStats);
router.get('/:id', authMiddleware, getOrderById);
router.get('/:id/verify', authMiddleware, updateOrderToPaid);

module.exports = router;
