const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();
mongoose.set('bufferCommands', false);

const categoryData = {
  'Handicrafts': {
    keywords: ['handicraft', 'wood carving', 'brass statue', 'bamboo craft', 'mask'],
    basePrice: 1500,
    descriptions: [
      'Authentic hand-carved piece by local artisans.',
      'Traditional craft passed down through generations.',
      'Made with sustainable local materials.',
      'Intricate detailing and premium finish.',
      'A perfect addition to your home decor collection.'
    ]
  },
  'Woven Clothes': {
    keywords: ['woven', 'textile', 'fabric', 'nepalese dress', 'pashmina', 'shawl'],
    basePrice: 2000,
    descriptions: [
      'Hand-loomed with high-quality natural fibers.',
      'Traditional patterns with a modern touch.',
      'Exceptionally soft and comfortable for all-day wear.',
      'Eco-friendly dyes and sustainable production.',
      'Beautifully crafted texture and design.'
    ]
  },
  'Lockets': {
    keywords: ['locket', 'pendant', 'jewelry', 'silver necklace', 'stone pendant'],
    basePrice: 3000,
    descriptions: [
      'Elegant design with spiritual symbolism.',
      'Handcrafted sterling silver with premium finish.',
      'Includes a delicate adjustable chain.',
      'Features authentic local gemstones.',
      'A timeless piece of jewelry for special occasions.'
    ]
  },
  'Pottery': {
    keywords: ['pottery', 'ceramics', 'clay pot', 'vase', 'terracotta'],
    basePrice: 800,
    descriptions: [
      'Kiln-fired at high temperatures for durability.',
      'Hand-thrown on a traditional potter\'s wheel.',
      'Natural clay finish with organic textures.',
      'Functional and decorative art piece.',
      'Unique glaze patterns that vary with every piece.'
    ]
  },
  'Painting': {
    keywords: ['painting', 'thangka', 'canvas art', 'watercolor', 'acrylic painting'],
    basePrice: 12000,
    descriptions: [
      'Original artwork signed by the artist.',
      'Rich colors and deep emotional resonance.',
      'Capturing the essence of local landscapes and culture.',
      'Hand-painted on high-quality archival canvas.',
      'Detailed brushwork and masterful composition.'
    ]
  }
};

async function seed() {
  console.log('Starting seed process...');
  console.log('MONGO_URI:', process.env.MONGO_URI);

  try {
    await connectDB();
    console.log('Connection established.');

    // Clear all existing products to avoid duplicates
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const allProducts = [];

    for (const [category, data] of Object.entries(categoryData)) {
      for (let i = 1; i <= 20; i++) {
        const keyword = data.keywords[i % data.keywords.length];
        const description = data.descriptions[i % data.descriptions.length];
        const price = data.basePrice + (Math.floor(Math.random() * 20) * 100);

        const imageUrl = `https://images.unsplash.com/photo-${getUnsplashId(category, i)}?auto=format&fit=crop&w=600&h=450&q=80`;

        allProducts.push({
          name: `${category} Piece #${i}`,
          price,
          description,
          image: imageUrl,
          category: category,
          countInStock: Math.floor(Math.random() * 50) + 1,
          featured: i <= 4
        });
      }
    }

    const created = await Product.insertMany(allProducts);
    console.log(`Successfully seeded ${created.length} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

function getUnsplashId(category, index) {
  const ids = {
    'Handicrafts': [
      '1582555172866-f73bb12a2ab3', '1513519245088-0e12902e5a38', '1615486511484-65e1723070f1',
      '1590736910111-96695679549d', '1544967082-d9d25d867d66', '1583417319070-4a69db38a482'
    ],
    'Woven Clothes': [
      '1624204327390-e83be90ecdf0', '1520006403909-838d6b92c22e', '1490481651871-ab68ff25d43d',
      '1556905055-1f38d3886cd3', '1506152983158-b4a74a01c721', '1445205170230-053b83e2b6a5'
    ],
    'Lockets': [
      '1535633302723-9975458da71d', '1515562141224-7a52ef2aa56f', '1602173574767-37ac01994b2a',
      '1599643478518-a784e5dc4c8f', '1601121141461-9d6647bca1ed', '1573408302355-4e0b7cb8de91'
    ],
    'Pottery': [
      '1590603700057-0bc875e53381', '1565193930434-830e003ae4b3', '1513106580091-1d8240898cd6',
      '1610701596007-11502444630a', '1578749553372-d6644280f74a', '1513519245088-0e12902e5a38'
    ],
    'Painting': [
      '1579783921274-7f9f9d6d394a', '1578301978693-85fa9c0320b9', '1541963463532-d68292c34b19',
      '1579762795188-aa33d23f8952', '1452860681190-382a5a1b3ddc', '1580136579312-d02ca3203f37'
    ]
  };
  const list = ids[category] || ids['Handicrafts'];
  return list[index % list.length];
}

seed();
