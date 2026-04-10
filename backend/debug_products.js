const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const products = await Product.find({});
    console.log('Products found:', products.length);
    products.forEach(p => {
      console.log(`Product: ${p.name}`);
      console.log(`  image: ${p.image}`);
      console.log(`  images: ${JSON.stringify(p.images)}`);
    });
    process.exit();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
