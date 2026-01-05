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
      <div className="bg-white rounded-2xl shadow-sm border border-brand-gray/50 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img src={product.image} alt={product.name} className="w-full h-96 object-cover" />
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-brand-dark mb-2">{product.name}</h2>
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">{product.category || product.category}</p>
          </div>

          <p className="text-brand-magenta font-bold text-3xl mb-6">${product.price}</p>

          <p className="mb-6 text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.countInStock > 0 ? t('prod_stock_in') : t('prod_stock_out')}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.countInStock && product.countInStock !== undefined}
            className="bg-brand-magenta text-white px-8 py-3.5 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg shadow-brand-magenta/20 hover:shadow-xl hover:-translate-y-0.5 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {t('prod_add')}
          </button>
        </div>
      </div>
    </section>
  );
}
