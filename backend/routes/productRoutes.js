const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const uploadImages = require('../middleware/uploadImages');

// Import product controller functions (implement these in controllers/productController.js)
const {
	getProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	createProductReview,
	updateProductReview,
	deleteProductReview,
	getRecommendedProducts,
	getInventoryAlerts,
	getUserRecommendations
} = require('../controllers/productController');

// GET /api/products/alerts - Get inventory alerts
router.get('/alerts', authMiddleware, getInventoryAlerts);

// GET /api/products/user/recommendations - Get personalized user recommendations
router.get('/user/recommendations', authMiddleware, getUserRecommendations);

// GET /api/products/:id/recommendations - Get product recommendations
router.get('/:id/recommendations', getRecommendedProducts);

// GET /api/products - Get all products
router.get('/', getProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/products - Create a new product (with up to 5 images)
router.post('/', authMiddleware, uploadImages.array('images', 5), createProduct);

// PUT /api/products/:id - Update a product
router.put('/:id', authMiddleware, uploadImages.array('images', 5), updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', authMiddleware, deleteProduct);

// POST /api/products/:id/reviews - Create a review
router.post('/:id/reviews', authMiddleware, createProductReview);

// PUT /api/products/:id/reviews/:reviewId - Update a review
router.put('/:id/reviews/:reviewId', authMiddleware, updateProductReview);

// DELETE /api/products/:id/reviews/:reviewId - Delete a review
router.delete('/:id/reviews/:reviewId', authMiddleware, deleteProductReview);

module.exports = router;
