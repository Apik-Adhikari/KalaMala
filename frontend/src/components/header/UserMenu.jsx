import { User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import LoginModal from "../header/auth/LoginModal.jsx";
import RegisterModal from "../header/auth/RegisterModal.jsx";

export default function UserMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const openLogin = () => {
    setDropdownOpen(false);
    setShowRegister(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setDropdownOpen(false);
    setShowLogin(false);
    setShowRegister(true);
  };

  return (
    <div className="relative" ref={ref}>
      {/* User Icon */}
      <button
        onClick={() => setDropdownOpen((s) => !s)}
        className="p-2 rounded-full hover:bg-gray-200"
        aria-label="User menu"
      >
        <User className="w-6 h-6" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-50">
          <button
            onClick={openLogin}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Login
          </button>
          <button
            onClick={openRegister}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Register
          </button>
        </div>
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitch={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSwitch={() => {
            // allow switching between modals
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}
