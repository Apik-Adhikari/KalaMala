import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/products?featured=true`);
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        if (mounted) setProducts(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <section className="max-w-7xl mx-auto px-8 py-10">Loading featured products…</section>;
  if (!products.length) return <section className="max-w-7xl mx-auto px-8 py-10">No featured products yet.</section>;

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-2">{t('featured_title')}</h2>
          <p className="text-gray-500">{t('featured_subtitle')}</p>
        </div>
        <button onClick={() => navigate('/products')} className="text-brand-magenta font-medium hover:text-pink-700 transition-colors hidden md:block">
          {t('view_all')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product._id || product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-brand-gray/50">
            <div className="relative overflow-hidden aspect-[4/3]">
              <img
                src={product.image || 'https://via.placeholder.com/400x300'}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-2 group-hover:text-brand-magenta transition-colors">{product.name}</h3>
              <div className="flex justify-between items-center mb-4">
                <p className="text-brand-magenta font-bold text-xl">${product.price}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className={`w-4 h-4 ${i <= (product.rating || 5) ? 'text-brand-yellow' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-brand-dark text-brand-dark font-medium hover:bg-brand-dark hover:text-white transition-colors duration-300 text-sm"
                  onClick={() => navigate(`/products/${product._id || product.id}`)}
                >
                  Details
                </button>
                <button
                  className="flex-1 bg-brand-magenta text-white px-4 py-2.5 rounded-lg font-medium hover:bg-pink-700 transition-colors duration-300 shadow-md hover:shadow-lg text-sm"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <button onClick={() => navigate('/products')} className="text-brand-magenta font-medium hover:text-pink-700 transition-colors">
          View all products &rarr;
        </button>
      </div>
    </section>
  );
}

function addToCart(productToAdd) {
  try {
    const raw = localStorage.getItem("cart");
    const cart = raw ? JSON.parse(raw) : [];
    const exists = cart.find((c) => c._id === productToAdd._id || c.id === productToAdd.id);
    let next;
    if (exists) {
      next = cart.map((c) => ((c._id === productToAdd._id || c.id === productToAdd.id) ? { ...c, qty: (c.qty || 1) + 1 } : c));
    } else {
      next = [...cart, { ...productToAdd, qty: 1 }];
    }
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    window.location.href = '/cart';
  } catch (e) {
    console.error('Failed to add to cart', e);
  }
}
