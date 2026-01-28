import Logo from "./Logo.jsx";
import NavMenu from "./NavMenu.jsx";
import SearchBar from "./SearchBar.jsx";
import UserMenu from "./UserMenu.jsx";
import CartIcon from "./CartIcon.jsx";
import CartBoard from "./CartBoard.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  // Close cart when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // initialize cart count from localStorage
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      const total = parsed.reduce((s, it) => s + (it.qty || 1), 0);
      setCount(total);
    } catch (e) {
      setCount(0);
    }

    // update count whenever cart in localStorage changes in another tab
    function onStorage(e) {
      if (e.key === "cart") {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          const total = parsed.reduce((s, it) => s + (it.qty || 1), 0);
          setCount(total);
        } catch (err) {
          setCount(0);
        }
      }
    }
    window.addEventListener("storage", onStorage);

    // listen for programmatic updates within the same tab
    function onCartUpdated() {
      try {
        const raw = localStorage.getItem("cart");
        const parsed = raw ? JSON.parse(raw) : [];
        const total = parsed.reduce((s, it) => s + (it.qty || 1), 0);
        setCount(total);
      } catch (e) {
        setCount(0);
      }
    }
    window.addEventListener('cart-updated', onCartUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener('cart-updated', onCartUpdated);
    };
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md w-full border-b border-brand-gray sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        <Logo />
        <SearchBar />
        <NavMenu />
        <div className="flex items-center gap-4 relative" ref={cartRef}>
          <button
            onClick={() => {
              if (user && user.role === 'seller') {
                navigate('/seller-dashboard');
              } else {
                navigate('/become-seller');
              }
            }}
            className="hidden md:block px-4 py-2 rounded-full border border-brand-magenta text-brand-magenta font-medium hover:bg-brand-magenta hover:text-white transition-all text-sm"
          >
            {user?.role === 'seller' ? 'My Shop' : 'Want to sell?'}
          </button>
          <LanguageSwitcher />
          <CartIcon count={count} onClick={() => setCartOpen(!cartOpen)} />
          {cartOpen && <CartBoard onClose={() => setCartOpen(false)} />}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}