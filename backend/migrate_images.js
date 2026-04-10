const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const products = await Product.find({});
    console.log('Total products:', products.length);
    
    let updatedCount = 0;
    for (const product of products) {
      let changed = false;
      
      if (product.image && product.image.includes('\\')) {
        product.image = product.image.replace(/\\/g, '/');
        changed = true;
      }
      
      if (product.images && product.images.length > 0) {
        const newImages = product.images.map(img => {
          if (img && img.includes('\\')) {
            changed = true;
            return img.replace(/\\/g, '/');
          }
          return img;
        });
        product.images = newImages;
      }
      
      if (changed) {
        await product.save();
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }
    
    console.log(`Migration completed. ${updatedCount} products updated.`);
    process.exit();
  })
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });
