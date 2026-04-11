const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();
        
        // Category Distribution
        const products = await Product.find();
        const categoryMap = {};
        products.forEach(p => {
            categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
        });
        const categoryDistribution = Object.keys(categoryMap).map(cat => ({
            label: cat,
            count: categoryMap[cat]
        }));

        // Registration Trends (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyRegs = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }
        ]);

        const sellers = await User.find({ role: 'seller' }).select('-password');
        const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
        
        res.json({
            stats: {
                users: userCount,
                products: productCount,
                orders: orderCount,
                categoryDistribution,
                dailyRegs
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

// PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        
        if (user) {
            user.role = role || user.role;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/admin/products/:id
exports.deleteProductWithReason = async (req, res) => {
    try {
        const { reason } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (product) {
            // Create notification for seller
            const sellerId = product.user || product.seller; // Check for both just in case
            if (sellerId) {
                try {
                    await Notification.create({
                        user: sellerId,
                        title: 'Product Removed by Admin',
                        message: reason || 'Your product was removed for violating platform policies.',
                        type: 'removal',
                        relatedProduct: product.name
                    });
                } catch (notifyErr) {
                    console.error('Failed to send notification:', notifyErr);
                    // Continue deletion even if notification fails
                }
            }
            
            await product.deleteOne();
            res.json({ message: 'Product removed and seller notified' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
