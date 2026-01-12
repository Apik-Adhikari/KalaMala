const User = require('../models/User');
const Seller = require('../models/Seller');
const generateToken = require('../utils/generateToken');

// @desc    Register a new seller (or update user to seller)
// @route   POST /api/sellers/register
// @access  Private
exports.registerSeller = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Not authorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create or update Seller document
        const shopName = req.body.shopName;
        const shopLocation = req.body.shopLocation;
        const shopPhone = req.body.shopPhone;

        if (!shopName || !shopLocation || !shopPhone) {
            return res.status(400).json({ message: 'Please provide all shop details' });
        }

        // Check if seller record already exists
        let seller = await Seller.findOne({ user: userId });

        if (seller) {
            console.log('Updating existing seller:', seller._id);
            seller.shopName = shopName;
            seller.shopLocation = shopLocation;
            seller.shopPhone = shopPhone;
            await seller.save();
        } else {
            console.log('Creating new seller for user:', userId);
            seller = await Seller.create({
                user: userId,
                shopName,
                shopLocation,
                shopPhone
            });
        }

        user.role = 'seller';
        const updatedUser = await user.save();
        console.log('User role updated to seller');

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            shopName: seller.shopName,
            shopLocation: seller.shopLocation,
            shopPhone: seller.shopPhone,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Error in registerSeller:', error);
        res.status(500).json({ message: error.message });
    }
};
