import Header from "./components/header/Header.jsx";
import Home from "./pages/Home.jsx";
import RegisterModal from "./components/header/auth/RegisterModal.jsx";
import LoginModal from "./components/header/auth/LoginModal.jsx";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";
import Footer from "./components/footer/Footer.jsx";

import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/register" element={<RegisterModal />} />
            <Route path="/login" element={<LoginModal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;