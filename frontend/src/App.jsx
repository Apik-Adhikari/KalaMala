import Header from "./components/header/Header.jsx";
import Home from "./pages/Home.jsx";
import RegisterModal from "./components/header/auth/RegisterModal.jsx";
import LoginModal from "./components/header/auth/LoginModal.jsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";
import Footer from "./components/footer/Footer.jsx";

import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import About from "./pages/About.jsx";
import BecomeSeller from "./components/header/auth/BecomeSeller.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import EditProduct from "./pages/EditProduct.jsx";

import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/register" element={<RegisterModal />} />
                <Route path="/login" element={<LoginModal />} />
                <Route path="/become-seller" element={<BecomeSeller />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/seller-dashboard" element={<SellerDashboard />} />
                <Route path="/edit-product/:id" element={<EditProduct />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;