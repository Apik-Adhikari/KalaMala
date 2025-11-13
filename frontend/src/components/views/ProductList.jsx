import React from "react";
import { useNavigate } from "react-router-dom";

// Dummy product data for demonstration
const products = [
  { id: 1, name: "Handmade Necklace", price: 25, image: "https://via.placeholder.com/150", description: "A beautiful handmade necklace crafted with care. Perfect for any occasion.", category: "Jewelry", stock: 12 },
  { id: 2, name: "Artisan Mug", price: 15, image: "https://via.placeholder.com/150", description: "A unique mug for your morning coffee.", category: "Ceramics", stock: 8 },
  { id: 3, name: "Wool Scarf", price: 30, image: "https://via.placeholder.com/150", description: "Warm and cozy wool scarf.", category: "Accessories", stock: 5 },
];

export default function ProductList() {
  const navigate = useNavigate();
  return (
    <section className="max-w-7xl mx-auto px-8 py-10">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <img src={product.image} alt={product.name} className="w-32 h-32 object-cover mb-4 rounded" />
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-blue-600 font-bold mb-2">${product.price}</p>
            <div className="flex gap-2 mt-3">
              <button
                className="bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                onClick={() => navigate(`/products/${product.id}`)}
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
    const exists = cart.find((c) => c.id === productToAdd.id);
    let next;
    if (exists) {
      next = cart.map((c) => (c.id === productToAdd.id ? { ...c, qty: (c.qty || 1) + 1 } : c));
    } else {
      next = [...cart, { ...productToAdd, qty: 1 }];
    }
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    // navigate to /cart
    window.location.href = '/cart';
  } catch (e) {
    console.error('Failed to add to cart', e);
  }
}
