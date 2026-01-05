import ProductDetails from "../components/views/ProductDetails.jsx";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        if (mounted) setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="py-10">Loading product…</div>;

  return (
    <div className="py-10">
      <ProductDetails product={product} />
    </div>
  );
}
