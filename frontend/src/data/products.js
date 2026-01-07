const getUnsplashId = (category, index) => {
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
};

const categoryData = {
    'Handicrafts': { basePrice: 1500, descriptions: ['Authentic hand-carved piece by local artisans.', 'Traditional craft passed down through generations.'] },
    'Woven Clothes': { basePrice: 2000, descriptions: ['Hand-loomed with high-quality natural fibers.', 'Traditional patterns with a modern touch.'] },
    'Lockets': { basePrice: 3000, descriptions: ['Elegant design with spiritual symbolism.', 'Handcrafted sterling silver with premium finish.'] },
    'Pottery': { basePrice: 800, descriptions: ['Kiln-fired at high temperatures for durability.', 'Hand-thrown on a traditional potter\'s wheel.'] },
    'Painting': { basePrice: 12000, descriptions: ['Original artwork signed by the artist.', 'Rich colors and deep emotional resonance.'] }
};

const generateProducts = () => {
    const products = [];
    let idCounter = 1;

    Object.entries(categoryData).forEach(([category, data]) => {
        for (let i = 1; i <= 20; i++) {
            const desc = data.descriptions[i % data.descriptions.length];
            const price = data.basePrice + (Math.floor(Math.random() * 20) * 100);
            const imageUrl = `https://images.unsplash.com/photo-${getUnsplashId(category, i)}?auto=format&fit=crop&w=600&h=450&q=80`;

            products.push({
                id: `static-${idCounter++}`,
                _id: `static-${idCounter}`,
                name: `${category} Piece #${i}`,
                price,
                description: desc,
                image: imageUrl,
                category: category,
                countInStock: Math.floor(Math.random() * 20) + 1,
                featured: i <= 4,
                rating: 4 + Math.random()
            });
        }
    });
    return products;
};

export const staticProducts = generateProducts();
