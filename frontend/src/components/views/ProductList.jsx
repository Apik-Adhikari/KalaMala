import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductList() {
  const navigate = useNavigate();
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
    <section className="max-w-7xl mx-auto px-8 py-10">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product._id || product.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-32 h-32 object-cover mb-4 rounded" />
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-blue-600 font-bold mb-2">${product.price}</p>
            <div className="flex gap-2 mt-3">
              <button
                className="bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                onClick={() => navigate(`/products/${product._id || product.id}`)}
              >
                View Details
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
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
