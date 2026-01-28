const Product = require('../models/Product');

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
    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
