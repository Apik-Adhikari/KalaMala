const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Import product controller functions (implement these in controllers/productController.js)
const {
	getProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	createProductReview,
	updateProductReview,
	deleteProductReview
} = require('../controllers/productController');

// GET /api/products - Get all products
router.get('/', getProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/products - Create a new product
router.post('/', authMiddleware, createProduct);

// PUT /api/products/:id - Update a product
router.put('/:id', authMiddleware, updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', authMiddleware, deleteProduct);

// POST /api/products/:id/reviews - Create a review
router.post('/:id/reviews', authMiddleware, createProductReview);

// PUT /api/products/:id/reviews/:reviewId - Update a review
router.put('/:id/reviews/:reviewId', authMiddleware, updateProductReview);

// DELETE /api/products/:id/reviews/:reviewId - Delete a review
router.delete('/:id/reviews/:reviewId', authMiddleware, deleteProductReview);

module.exports = router;
