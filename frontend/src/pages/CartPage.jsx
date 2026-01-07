import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function CartPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(parsed);
    } catch (e) {
      setItems([]);
    }
  }, []);

  const totalPrice = items.reduce((s, it) => s + (it.qty || 1) * (it.price || 0), 0);

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem("cart", JSON.stringify(nextItems));
    // notify other components (like Header) about update
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const updateQty = (id, qty) => {
    const next = items.map((it) => (it.id === id ? { ...it, qty } : it));
    persist(next);
  };

  const removeItem = (id) => {
    const next = items.filter((it) => it.id !== id);
    persist(next);
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center py-24">
        <div className="inline-block p-12 bg-white rounded-3xl shadow-sm border border-brand-gray/50 mb-8">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-4">{t('cart_empty')}</h2>
          <div>
            <button
              onClick={() => navigate('/')}
              className="bg-brand-magenta text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-brand-magenta/20 hover:-translate-y-1"
            >
              {t('cart_browse')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-dark mb-8">{t('cart_title')}</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-brand-gray/50 overflow-hidden">
        <ul className="divide-y divide-brand-gray/50">
          {items.map((it) => (
            <li key={it.id} className="p-6 flex items-center gap-6 hover:bg-brand-gray/10 transition-colors">
              <img src={it.image} alt={it.name} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-lg text-brand-dark">{it.name}</h3>
                  <div className="font-bold text-xl text-brand-magenta">Rs. {((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-brand-gray/30 rounded-lg p-1">
                    <button
                      onClick={() => updateQty(it.id, Math.max(1, (it.qty || 1) - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-100 font-bold text-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <div className="w-8 text-center font-bold text-brand-dark">{it.qty || 1}</div>
                    <button
                      onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-gray-100 font-bold text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-red-500 font-medium hover:text-red-700 hover:underline transition-colors text-sm"
                  >
                    {t('cart_item_remove')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="bg-brand-gray/10 p-8">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-medium text-gray-600">{t('cart_total')}</span>
            <span className="text-3xl font-bold text-brand-dark">Rs. {totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-brand-dark text-brand-dark font-bold rounded-xl hover:bg-brand-dark hover:text-white transition-all duration-300"
            >
              {t('cart_browse')}
            </button>
            <button
              onClick={() => alert('Checkout flow not implemented yet')}
              className="px-8 py-3 bg-brand-magenta text-white font-bold rounded-xl hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-brand-magenta/20 hover:-translate-y-1"
            >
              {t('cart_checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
