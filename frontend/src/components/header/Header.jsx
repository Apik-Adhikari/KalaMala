import Logo from "./Logo.jsx";
import NavMenu from "./NavMenu.jsx";
import SearchBar from "./SearchBar.jsx";
import UserMenu from "./UserMenu.jsx";
import CartIcon from "./CartIcon.jsx";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

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
    <header className="bg-blue-300 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        <Logo />
        <SearchBar />
        <NavMenu />
        <div className="flex items-center gap-4 relative">
          <CartIcon count={count} onClick={() => navigate("/cart")} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}