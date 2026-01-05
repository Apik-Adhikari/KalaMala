const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();
connectDB();

async function seed() {
  try {
    const items = [
      {
        name: 'Handmade Necklace',
        price: 25,
        image: 'https://via.placeholder.com/300x300.png?text=Necklace',
        description: 'A beautiful handmade necklace crafted with care. Perfect for any occasion.',
        category: 'Jewelry',
        countInStock: 12,
        featured: true
      },
      {
        name: 'Artisan Mug',
        price: 15,
        image: 'https://via.placeholder.com/300x300.png?text=Mug',
        description: 'A unique mug for your morning coffee.',
        category: 'Ceramics',
        countInStock: 8,
        featured: true
      },
      {
        name: 'Wool Scarf',
        price: 30,
        image: 'https://via.placeholder.com/300x300.png?text=Scarf',
        description: 'Warm and cozy wool scarf.',
        category: 'Accessories',
        countInStock: 5,
        featured: true
      }
    ];

    // Remove existing featured products (optional)
    await Product.deleteMany({ featured: true });

    const created = await Product.insertMany(items);
    console.log('Seeded products:', created.map(p => ({ id: p._id, name: p.name })));
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
