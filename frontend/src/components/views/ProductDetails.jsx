import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductDetails({ product }) {
  const navigate = useNavigate();
  if (!product) return null;
  return (
    <section className="max-w-3xl mx-auto px-8 py-10">
      <button className="mb-6 text-blue-500 hover:underline" onClick={() => navigate("/") }>&larr; Back to Products</button>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <img src={product.image} alt={product.name} className="w-64 h-64 object-cover rounded shadow" />
        <div>
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-blue-600 font-bold text-xl mb-2">${product.price}</p>
          <p className="mb-4 text-gray-700">{product.description}</p>
          <p className="mb-2 text-sm text-gray-500">Category: {product.category}</p>
          <p className="mb-4 text-sm text-gray-500">In Stock: {product.stock}</p>
          <button className="bg-blue-300 text-white px-6 py-2 rounded hover:bg-blue-400 transition">Add to Cart</button>
        </div>
      </div>
    </section>
  );
}
