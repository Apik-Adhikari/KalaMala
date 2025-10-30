import React, { useState, useEffect } from "react";
import ProductList from "../components/views/ProductList.jsx";
import ProductDetails from "../components/views/ProductDetails.jsx";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };


  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/users/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="py-10">
      <div className="text-center mb-10 text-2xl font-bold">
        Welcome! This is {user?.name ? user.name : ""} homepage.
      </div>
      {!selectedProduct ? (
        <ProductList onViewDetails={handleViewDetails} />
      ) : (
        <ProductDetails product={selectedProduct} onBack={handleBack} />
      )}
    </div>
  );
}
