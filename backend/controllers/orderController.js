const Order = require('../models/Order');
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
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
