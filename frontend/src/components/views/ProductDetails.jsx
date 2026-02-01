import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductDetails({ product }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  if (!product) return null;

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
    <section className="max-w-4xl mx-auto px-8 py-12">
      <button
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-brand-magenta transition-colors font-medium group"
        onClick={() => navigate("/")}
      >
        <span className="transform group-hover:-translate-x-1 transition-transform inline-block">&larr;</span> {t('prod_back')}
      </button>
      <div className="bg-white rounded-3xl shadow-xl border border-brand-gray/30 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side: Product Image */}
        <div className="lg:w-1/2 relative group">
          <img
            src={product.image || 'https://via.placeholder.com/600x600'}
            alt={product.name}
            className="w-full h-full min-h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 bg-brand-yellow/90 backdrop-blur-sm text-brand-dark text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            {product.category}
          </div>
        </div>

        {/* Right Side: Product & Seller Info */}
        <div className="p-10 lg:w-1/2 flex flex-col">
          <div className="mb-8">
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-3 leading-tight">{product.name}</h2>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${product.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.countInStock > 0 ? `${product.countInStock} ${t('prod_stock_in')}` : t('prod_stock_out')}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-5 h-5 text-brand-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-brand-magenta font-bold text-2xl">Rs. {product.price}</span>
            </div>
          </div>

          <div className="space-y-8 flex-grow">
            {/* Description Section */}
            <section>
              <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
            </section>

            {/* Seller Information - For Transparency */}
            <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-bold text-brand-magenta uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Seller Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v4a1 1 0 01-1 1h-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Shop Name</p>
                    <p className="font-bold text-gray-900">{product.seller?.shopName || 'KalaMala Partner'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Location</p>
                    <p className="text-gray-900">{product.seller?.shopLocation || 'Kathmandu, Nepal'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                    <p className="text-gray-900">{product.seller?.shopPhone || '+977-9800000000'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.countInStock && product.countInStock !== undefined}
            className="mt-10 bg-brand-magenta text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-pink-700 transition-all shadow-2xl shadow-brand-magenta/30 hover:shadow-brand-magenta/40 hover:-translate-y-1 transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {t('prod_add')}
          </button>
        </div>
      </div>
    </section>
  );
}
