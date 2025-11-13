import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartBoard({ onClose }) {
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
    <div className="absolute right-0 mt-2 w-96 bg-white rounded shadow-lg z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Cart</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center">
          <p className="mb-4 text-gray-600">Your cart is empty.</p>
          <button
            onClick={() => {
              onClose?.();
              navigate("/");
            }}
            className="bg-blue-300 text-white px-4 py-2 rounded"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="p-4">
          <ul className="space-y-3 max-h-64 overflow-auto">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <img src={it.image} alt={it.name} className="w-14 h-14 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">Qty: {it.qty || 1}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateQty(it.id, Math.max(1, (it.qty || 1) - 1))} className="px-2 py-1 border rounded">-</button>
                    <div className="px-3">{it.qty || 1}</div>
                    <button onClick={() => updateQty(it.id, (it.qty || 1) + 1)} className="px-2 py-1 border rounded">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
                  <button onClick={() => removeItem(it.id)} className="text-sm text-red-500 hover:underline mt-1">Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between mb-3">
              <div className="text-gray-600">Items</div>
              <div className="font-medium">{totalQty}</div>
            </div>
            <div className="flex justify-between mb-4">
              <div className="text-gray-600">Total</div>
              <div className="font-semibold">${totalPrice.toFixed(2)}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose?.();
                  navigate("/cart");
                }}
                className="flex-1 border border-gray-300 px-4 py-2 rounded"
              >
                View Cart
              </button>
              <button
                onClick={() => {
                  onClose?.();
                  navigate("/checkout");
                }}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
