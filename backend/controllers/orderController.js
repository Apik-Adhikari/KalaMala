const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            orderItems,
            user: req.user.id,
            shippingAddress,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Prepare eSewa signature (v2)
        // For sandbox: secret = 8g8M898P8Go783z4, product_code = EPAYTEST
        const secret = '8gBm/:&EnhH.1/q';
        const total_amount_val = Math.round(totalPrice);
        const total_amount_str = total_amount_val.toString();

        const transaction_uuid = createdOrder._id.toString();
        const product_code = 'EPAYTEST';

        const signatureString = `total_amount=${total_amount_str},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const hash = crypto.createHmac('sha256', secret).update(signatureString).digest('base64');

        const esewaData = {
            amount: total_amount_str,
            tax_amount: "0",
            total_amount: total_amount_str,
            transaction_uuid: transaction_uuid,
            product_code: product_code,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: 'http://localhost:5173/payment-success',
            failure_url: 'http://localhost:5173/payment-failure',
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: hash,
        };

        console.log('--- eSewa Debug Info ---');
        console.log('Raw Total Price:', totalPrice);
        console.log('Final total_amount:', total_amount_str);
        console.log('Final transaction_uuid:', transaction_uuid);
        console.log('Final product_code:', product_code);
        console.log('Secret Key (masked):', secret.substring(0, 4) + '...');
        console.log('Signature String:', `"${signatureString}"`);
        console.log('Generated Hash:', hash);
        console.log('------------------------');

        res.status(201).json({
            order: createdOrder,
            esewaData: esewaData,
        });
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'username email');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid (eSewa Verification)
// @route   GET /api/orders/:id/verify
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // In a real production app, we would call eSewa's verification API here.
            // For this implementation, we trust the success redirect params and mark as paid.
            // eSewa sends encoded data in the URL on success.

            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                transactionId: req.query.data || 'eSewa-txn', // The encoded data string from eSewa
                status: 'COMPLETE',
            };

            const updatedOrder = await order.save();
            console.log('--- PAYMENT SUCCESS: Order marked as PAID ---');
            console.log('Order ID:', updatedOrder._id);
            console.log('Total Items to process:', updatedOrder.orderItems.length);

            // --- Post-Payment Processing ---
            // 1. Reduce Stock and 2. Notify Sellers
            for (const item of updatedOrder.orderItems) {
                try {
                    console.log(`Processing Item: ${item.name} (Qty: ${item.qty})`);
                    const product = await Product.findById(item.product);
                    
                    if (!product) {
                        console.error(`ERROR: Product not found for ID: ${item.product}`);
                        continue;
                    }

                    console.log(`Current Stock for ${product.name}: ${product.countInStock}`);
                    
                    // Reduce Stock
                    const oldStock = product.countInStock;
                    product.countInStock = Math.max(0, product.countInStock - item.qty);
                    await product.save();
                    console.log(`Updated Stock for ${product.name}: ${oldStock} -> ${product.countInStock}`);

                    // Notify Seller
                    const sellerId = product.user;
                    console.log(`Notifying Seller ID: ${sellerId}`);

                    if (sellerId) {
                        const note = await Notification.create({
                            user: sellerId,
                            title: 'New Order Received! 💰',
                            message: `Your product "${product.name}" has been sold (Quantity: ${item.qty}). Total earned: Rs. ${item.qty * item.price}. Check your dashboard for details.`,
                            type: 'success',
                            relatedProduct: product.name
                        });
                        console.log(`Notification created successfully: ${note._id}`);
                    } else {
                        console.warn(`WARNING: Product ${product.name} has no associated seller (user field is empty)`);
                    }
                } catch (itemErr) {
                    console.error(`ERROR processing item ${item.name}:`, itemErr);
                }
            }

            console.log('--- POST-PAYMENT PROCESSING COMPLETE ---');
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sales trends for seller
// @route   GET /api/orders/sales-trends
// @access  Private/Seller
exports.getSalesTrends = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // Aggregate sales data for the seller's products
        const salesData = await Order.aggregate([
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $match: {
                    'productInfo.user': new mongoose.Types.ObjectId(sellerId),
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$paidAt' }
                    },
                    totalSales: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedData = salesData.map(item => ({
            date: item._id,
            sales: item.totalSales
        }));

        res.json(formattedData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get total stats for seller (Revenue, Sales Count)
// @route   GET /api/orders/seller/stats
// @access  Private/Seller
exports.getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const stats = await Order.aggregate([
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $match: {
                    'productInfo.user': new mongoose.Types.ObjectId(sellerId),
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
                    totalSalesCount: { $sum: '$orderItems.qty' }
                }
            }
        ]);

        const result = stats[0] || { totalRevenue: 0, totalSalesCount: 0 };
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
