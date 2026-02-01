const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    shopName: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true
    },
    shopLocation: {
        type: String,
        required: [true, 'Shop location is required']
    },
    shopPhone: {
        type: String,
        required: [true, 'Shop phone number is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;
