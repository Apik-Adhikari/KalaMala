import ProductDetails from "../components/views/ProductDetails.jsx";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { staticProducts } from "../data/products";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate slight delay
    const timer = setTimeout(() => {
      // Check both id and _id since static data has both for compatibility
      const found = staticProducts.find(p => p.id === id || p._id === id);
      setProduct(found);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
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
