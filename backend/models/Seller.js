const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    sellerName: {
        type: String,
        required: [true, 'Seller name is required'],
        trim: true
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
    documentPhoto: {
        type: String,
        required: [true, 'Document photo is required']
    },
    businessType: {
        type: String,
        required: [true, 'Business type is required']
    },
    idDocumentType: {
        type: String,
        enum: ['Citizenship', 'Passport', 'National ID', 'Driving License'],
        required: [true, 'ID Document type is required']
    },
    shopDescription: {
        type: String,
        required: [true, 'Shop description is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;
