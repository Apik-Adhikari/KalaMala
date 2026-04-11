const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getStats, getAllUsers, getAllProducts, getAllOrders, updateUserRole, deleteProductWithReason } = require('../controllers/adminController');

// All routes here require admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProductWithReason);
router.get('/orders', getAllOrders);

module.exports = router;
