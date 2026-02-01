import { User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function UserMenu() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      {/* User Icon */}
      <button
        onClick={() => setDropdownOpen((s) => !s)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-brand-gray/50 transition-all duration-300 group overflow-hidden"
        aria-label="User menu"
      >
        {user ? (
          <div className="w-full h-full bg-brand-magenta text-white flex items-center justify-center font-bold text-lg uppercase">
            {user.name ? user.name.charAt(0) : user.email.charAt(0)}
          </div>
        ) : (
          <User className="w-6 h-6 text-brand-dark group-hover:text-brand-magenta transition-colors" />
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-brand-gray/50 overflow-hidden ring-1 ring-black/5 animation-fade-in z-50">
          {!user ? (
            <>
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
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-brand-gray/30 bg-brand-light/20">
                <p className="text-xs text-gray-400 font-medium truncate">{user.email}</p>
                <p className="text-sm font-bold text-brand-dark truncate">{user.name}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="block w-full text-left px-4 py-3 text-sm text-brand-dark hover:bg-brand-light hover:text-brand-magenta transition-colors"
              >
                {t('user_profile') || 'Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-brand-gray/30"
              >
                {t('user_logout') || 'Logout'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
