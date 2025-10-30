import ProductDetails from "../components/views/ProductDetails.jsx";
import { useParams } from "react-router-dom";

// Dummy product data (should be fetched from backend in real app)
const products = [
  { id: 1, name: "Handmade Necklace", price: 25, image: "https://via.placeholder.com/150", description: "A beautiful handmade necklace crafted with care. Perfect for any occasion.", category: "Jewelry", stock: 12 },
  { id: 2, name: "Artisan Mug", price: 15, image: "https://via.placeholder.com/150", description: "A unique mug for your morning coffee.", category: "Ceramics", stock: 8 },
  { id: 3, name: "Wool Scarf", price: 30, image: "https://via.placeholder.com/150", description: "Warm and cozy wool scarf.", category: "Accessories", stock: 5 },
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  return (
    <div className="py-10">
      <ProductDetails product={product} />
    </div>
  );
}
