const User = require('../models/User');
const Seller = require('../models/Seller');
const generateToken = require('../utils/generateToken');

// @desc    Register a new seller (Submit request)
// @route   POST /api/sellers/register
// @access  Private
exports.registerSeller = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { 
            sellerName, shopName, shopLocation, shopPhone, 
            businessType, shopDescription, idDocumentType 
        } = req.body;

        console.log('Received data:', {
            sellerName,
            shopName,
            shopLocation,
            shopPhone,
            businessType,
            shopDescription,
            idDocumentType,
            file: req.file?.filename
        });

        // Trim and validate each field
        const trimmedSellerName = sellerName?.trim();
        const trimmedShopName = shopName?.trim();
        const trimmedShopLocation = shopLocation?.trim();
        const trimmedShopPhone = shopPhone?.trim();
        const trimmedBusinessType = businessType?.trim();
        const trimmedShopDescription = shopDescription?.trim();
        const trimmedIdDocumentType = idDocumentType?.trim();

        console.log('Trimmed data:', {
            trimmedSellerName,
            trimmedShopName,
            trimmedShopLocation,
            trimmedShopPhone,
            trimmedBusinessType,
            trimmedShopDescription,
            trimmedIdDocumentType
        });

        const missingFields = [];
        if (!trimmedSellerName) missingFields.push('sellerName');
        if (!trimmedShopName) missingFields.push('shopName');
        if (!trimmedShopLocation) missingFields.push('shopLocation');
        if (!trimmedShopPhone) missingFields.push('shopPhone');
        if (!trimmedBusinessType) missingFields.push('businessType');
        if (!trimmedShopDescription) missingFields.push('shopDescription');
        if (!trimmedIdDocumentType) missingFields.push('idDocumentType');

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({ 
                message: 'Please provide all business and authentication details',
                missingFields: missingFields
            });
        }

        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'Document photo is required' });
        }

        // Check if seller record already exists
        let seller = await Seller.findOne({ user: userId });

        if (seller) {
            // Re-submit or update pending/rejected request
            seller.sellerName = trimmedSellerName;
            seller.shopName = trimmedShopName;
            seller.shopLocation = trimmedShopLocation;
            seller.shopPhone = trimmedShopPhone;
            seller.documentPhoto = req.file.filename;
            seller.businessType = trimmedBusinessType;
            seller.shopDescription = trimmedShopDescription;
            seller.idDocumentType = trimmedIdDocumentType;
            seller.status = 'pending'; // Reset to pending on update
            await seller.save();
        } else {
            seller = await Seller.create({
                sellerName: trimmedSellerName,
                user: userId,
                shopName: trimmedShopName,
                shopLocation: trimmedShopLocation,
                shopPhone: trimmedShopPhone,
                documentPhoto: req.file.filename,
                businessType: trimmedBusinessType,
                shopDescription: trimmedShopDescription,
                idDocumentType: trimmedIdDocumentType,
                status: 'pending'
            });
        }

        res.json({
            message: 'Seller registration request submitted. Please wait for admin approval.',
            status: seller.status
        });
    } catch (error) {
        console.error('Error in registerSeller:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all seller requests (Admin only)
// @route   GET /api/sellers/requests
// @access  Private/Admin
exports.getSellerRequests = async (req, res) => {
    try {
        const requests = await Seller.find({ status: 'pending' }).populate('user', 'fullName email');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject seller request (Admin only)
// @route   PUT /api/sellers/verify/:id
// @access  Private/Admin
exports.verifySeller = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ message: 'Seller request not found' });

        seller.status = status;
        await seller.save();

        if (status === 'approved') {
            const user = await User.findById(seller.user);
            if (user) {
                user.role = 'seller';
                await user.save();
            }
        }

        res.json({ message: `Seller request ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
