const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        
        const sellers = await User.find({ role: 'seller' }).select('-password');
        const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
        
        res.json({
            stats: {
                users: userCount,
                products: productCount,
                orders: orderCount
            },
            sellers,
            recentProducts
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('user', 'username shopName');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'username email');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
