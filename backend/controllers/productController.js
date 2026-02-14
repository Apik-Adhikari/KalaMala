const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/products?featured=true&seller=id
exports.getProducts = async (req, res) => {
  try {
    const { featured, category, seller } = req.query;
    const filter = {};
    if (featured === 'true') filter.featured = true;
    if (category) filter.category = category;
    if (seller) filter.user = seller;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Fetch seller info
    const Seller = require('../models/Seller');
    const seller = await Seller.findOne({ user: product.user });

    const productData = product.toObject();
    if (seller) {
      productData.seller = {
        shopName: seller.shopName,
        shopLocation: seller.shopLocation,
        shopPhone: seller.shopPhone
      };
    }

    res.json(productData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products - create a product
exports.createProduct = async (req, res) => {
  try {
    const { name, price = 0, description = '', image = '', category = '', countInStock = 0, featured = false } = req.body;

    // Ensure user is attached (from auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const product = new Product({
      user: req.user.id,
      name,
      price,
      description,
      image,
      category,
      countInStock,
      featured
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    Object.assign(product, req.body);
    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      // Fetch user to get the name (since token only has ID)
      const userDoc = await User.findById(req.user.id);

      const review = {
        name: userDoc?.username || userDoc?.name || 'Authenticated User',
        rating: Number(rating) || 5, // Fallback to 5 if something is wrong
        comment: comment || 'No comment provided',
        user: req.user.id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      // Handle legacy products that might be missing the 'user' field or have an invalid one
      // to avoid "Product validation failed: user: Path `user` is required"
      if (!product.user || !mongoose.Types.ObjectId.isValid(product.user)) {
        product.user = req.user.id;
      }

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc    Update a review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
exports.updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = product.reviews.id(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check if user is the author
      if (review.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this review' });
      }

      review.rating = Number(rating) || review.rating;
      review.comment = comment || review.comment;

      // Ensure product has a valid user field (fix for legacy data)
      if (!product.user || !mongoose.Types.ObjectId.isValid(product.user)) {
        product.user = req.user.id;
      }

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.json({ message: 'Review updated' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
exports.deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = product.reviews.id(req.params.reviewId);

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check if user is the author
      if (review.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this review' });
      }

      // Use Mongoose pull to remove the subdocument correctly
      product.reviews.pull(req.params.reviewId);

      product.numReviews = product.reviews.length;

      if (product.numReviews > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.rating = 0;
      }

      // Ensure product has a valid user field (fix for legacy data)
      if (!product.user || !mongoose.Types.ObjectId.isValid(product.user)) {
        product.user = req.user.id;
      }

      await product.save();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
