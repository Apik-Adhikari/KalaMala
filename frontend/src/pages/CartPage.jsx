import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
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
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="inline-block p-8 bg-white rounded shadow">
          <div className="text-6xl">🛒</div>
          <h2 className="text-2xl font-semibold mt-4">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="bg-white rounded shadow p-4">
        <ul className="space-y-4">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-4">
              <img src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-500">Price: ${it.price?.toFixed(2) ?? '0.00'}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => updateQty(it.id, Math.max(1, (it.qty || 1) - 1))}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <div className="px-3">{it.qty || 1}</div>
                  <button
                    onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="ml-4 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-medium">Total: ${totalPrice.toFixed(2)}</div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border rounded"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => alert('Checkout flow not implemented yet')}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
