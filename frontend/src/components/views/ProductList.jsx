import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { staticProducts } from "../../data/products";

export default function ProductList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', key: 'cat_all' },
    { id: 'Handicrafts', key: 'cat_handicrafts' },
    { id: 'Woven Clothes', key: 'cat_woven' },
    { id: 'Lockets', key: 'cat_lockets' },
    { id: 'Pottery', key: 'cat_pottery' },
    { id: 'Painting', key: 'cat_painting' },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate slight delay for "loading" feel
    const timer = setTimeout(() => {
      let filtered;
      if (activeCategory === 'all') {
        filtered = staticProducts.filter(p => p.featured).slice(0, 8);
      } else {
        filtered = staticProducts.filter(p => p.category === activeCategory);
      }
      setProducts(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCategory]);

  const addToCart = (productToAdd) => {
    try {
      const raw = localStorage.getItem("cart");
      const cart = raw ? JSON.parse(raw) : [];
      const exists = cart.find((c) => c.id === productToAdd.id);
      let next;
      if (exists) {
        next = cart.map((c) => (c.id === productToAdd.id ? { ...c, qty: (c.qty || 1) + 1 } : c));
      } else {
        next = [...cart, { ...productToAdd, qty: 1 }];
      }
      localStorage.setItem("cart", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('cart-updated'));
      navigate('/cart');
    } catch (e) {
      console.error('Failed to add to cart', e);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-2">
            {activeCategory === 'all' ? t('featured_title') : t(categories.find(c => c.id === activeCategory)?.key)}
          </h2>
          <p className="text-gray-500">{t('featured_subtitle')}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === cat.id
                ? 'bg-brand-magenta text-white border-brand-magenta shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-magenta hover:text-brand-magenta'
                }`}
            >
              {t(cat.key)}
            </button>
          ))}
        </div>

        <button onClick={() => navigate('/products')} className="text-brand-magenta font-medium hover:text-pink-700 transition-colors hidden lg:block">
          {t('view_all')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-80"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-brand-gray/50 flex flex-col">
              <div
                className="relative overflow-hidden aspect-[4/3] cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <img
                  src={product.image || 'https://via.placeholder.com/400x300'}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                {product.category && (
                  <span className="absolute top-3 left-3 bg-brand-yellow/90 text-brand-dark text-xs font-bold px-2 py-1 rounded shadow-sm">
                    {product.category}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3
                  className="text-lg font-bold text-brand-dark mb-1 group-hover:text-brand-magenta transition-colors line-clamp-1 cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">{product.category}</p>

                <div className="flex justify-between items-center mb-4 mt-auto">
                  <p className="text-brand-magenta font-bold text-xl">Rs. {product.price}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i <= (product.rating || 5) ? 'text-brand-yellow' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 rounded-lg border border-brand-dark text-brand-dark font-medium hover:bg-brand-dark hover:text-white transition-colors duration-300 text-xs"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    Details
                  </button>
                  <button
                    className="flex-1 bg-brand-magenta text-white px-3 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors duration-300 shadow-sm text-xs"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center md:hidden">
        <button onClick={() => navigate('/products')} className="text-brand-magenta font-medium hover:text-pink-700 transition-colors">
          View all products &rarr;
        </button>
      </div>
    </section>
  );
}
