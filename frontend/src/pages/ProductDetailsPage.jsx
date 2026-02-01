import ProductDetails from "../components/views/ProductDetails.jsx";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { staticProducts } from "../data/products";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Try fetching from backend first
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          // Fallback to static data if backend fails or product not found
          const found = staticProducts.find(p => p.id === id || p._id === id);
          setProduct(found);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        const found = staticProducts.find(p => p.id === id || p._id === id);
        setProduct(found);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-magenta"></div>
    </div>
  );

  return (
    <div className="py-10">
      <ProductDetails product={product} />
    </div>
  );
}
