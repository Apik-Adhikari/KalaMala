import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function CartBoard({ onClose }) {
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

  const persist = (next) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
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

  const totalQty = items.reduce((s, it) => s + (it.qty || 1), 0);
  const totalPrice = items.reduce((s, it) => s + (it.qty || 1) * (it.price || 0), 0);

  return (
    <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-xl border border-brand-gray/20 z-50 overflow-hidden ring-1 ring-black/5 animation-fade-in">
      <div className="p-4 border-b border-brand-gray/20 flex justify-between items-center bg-brand-light">
        <h3 className="text-lg font-serif font-bold text-brand-dark">{t('cart_title')}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-brand-magenta transition-colors">
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-3">🛒</div>
          <p className="mb-6 text-gray-500 font-medium">{t('cart_empty')}</p>
          <button
            onClick={() => {
              onClose?.();
              navigate("/");
            }}
            className="bg-brand-magenta text-white px-6 py-2.5 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-brand-magenta/20"
          >
            {t('cart_browse')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col max-h-[calc(100vh-200px)]">
          <ul className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.map((it) => (
              <li key={it.id} className="flex gap-4 group">
                <img src={it.image} alt={it.name} className="w-16 h-16 object-cover rounded-lg shadow-sm border border-brand-gray/20" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-brand-dark text-sm line-clamp-1">{it.name}</div>
                    <button onClick={() => removeItem(it.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{t('cart_qty')}: {it.qty || 1}</div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-brand-gray/30 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQty(it.id, Math.max(1, (it.qty || 1) - 1))}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-xs font-bold hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{it.qty || 1}</span>
                      <button
                        onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-xs font-bold hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-brand-magenta text-sm">${((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-brand-light border-t border-brand-gray/20">
            <div className="flex justify-between mb-4">
              <div className="text-gray-600 font-medium">{t('cart_subtotal')}</div>
              <div className="font-bold text-xl text-brand-dark">${totalPrice.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose?.();
                  navigate("/cart");
                }}
                className="w-full border-2 border-brand-dark text-brand-dark px-4 py-2.5 rounded-xl font-bold hover:bg-brand-dark hover:text-white transition-all text-sm"
              >
                {t('cart_view')}
              </button>
              <button
                onClick={() => {
                  onClose?.();
                  navigate("/checkout");
                }}
                className="w-full bg-brand-magenta text-white px-4 py-2.5 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-brand-magenta/20 hover:-translate-y-0.5 text-sm"
              >
                {t('cart_checkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
