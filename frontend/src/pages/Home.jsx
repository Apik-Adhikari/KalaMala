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
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // token invalid or expired
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
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
