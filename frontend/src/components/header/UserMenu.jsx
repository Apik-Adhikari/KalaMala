import { User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function UserMenu() {
  const { t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

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
    navigate('/login');
  };

  const openRegister = () => {
    setDropdownOpen(false);
    navigate('/register');
  };

  return (
    <div className="relative" ref={ref}>
      {/* User Icon */}
      <button
        onClick={() => setDropdownOpen((s) => !s)}
        className="p-2 rounded-full hover:bg-brand-gray/50 transition-all duration-300 group"
        aria-label="User menu"
      >
        <User className="w-6 h-6 text-brand-dark group-hover:text-brand-magenta transition-colors" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-brand-gray/50 overflow-hidden ring-1 ring-black/5 animation-fade-in z-50">
          <button
            onClick={openLogin}
            className="block w-full text-left px-4 py-3 text-sm text-brand-dark hover:bg-brand-light hover:text-brand-magenta transition-colors"
          >
            {t('user_login')}
          </button>
          <button
            onClick={openRegister}
            className="block w-full text-left px-4 py-3 text-sm text-brand-dark hover:bg-brand-light hover:text-brand-magenta transition-colors border-t border-brand-gray/30"
          >
            {t('user_register')}
          </button>
        </div>
      )}
    </div>
  );
}
