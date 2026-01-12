import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";

// Simple flash message component
function FlashMessage({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
      <button onClick={onClose} className="ml-4 font-bold">×</button>
    </div>
  );
}

export default function RegisterModal({ onClose, onSwitch }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "+977", // default Nepali code
    password: "",
    confirmPassword: "",
  });
  const [flash, setFlash] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim phone input
    const trimmedPhone = formData.phone.trim();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Validate Nepali number (starts with +977 and 10 digits after)
    const nepaliNumberRegex = /^\+977[0-9]{10}$/;
    if (!nepaliNumberRegex.test(trimmedPhone)) {
      alert("Please enter a valid Nepali number (e.g. +9779812345678)");
      return;
    }

    // Use trimmed phone in the data sent to backend
    const registerData = { ...formData, phone: trimmedPhone };

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.ok) {
        setFlash("User registered successfully!");
        setFormData({ username: "", email: "", phone: "+977", password: "", confirmPassword: "" });
        // Save token and user info to localStorage so the user is treated as logged in
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.username, email: data.email, role: data.role }));
        }
        setTimeout(() => {
          setFlash("");
          if (onClose && typeof onClose === 'function') onClose();
          navigate("/");
        }, 800);
      } else {
        setFlash(data.message || "Registration failed");
      }
    } catch (err) {
      setFlash("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // 🔗 Replace this with Google OAuth logic
    alert("Google signup clicked!");
  };

  return (
    <>
      <FlashMessage message={flash} onClose={() => setFlash("")} />
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-gray/20 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-serif font-bold mb-6 text-center text-brand-dark">{t('auth_register_title')}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="username"
              placeholder={t('auth_username')}
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
            />

            <input
              type="email"
              name="email"
              placeholder={t('auth_email')}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
            />

            <input
              type="tel"
              name="phone"
              placeholder={t('auth_phone')}
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
            />

            <input
              type="password"
              name="password"
              placeholder={t('auth_password')}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder={t('auth_confirm_password')}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
            />

            <button
              type="submit"
              className="bg-brand-magenta text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-brand-magenta/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              disabled={loading}
            >
              {loading ? t('auth_registering') : t('auth_register_btn')}
            </button>
          </form>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="mt-4 w-full py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors font-medium text-brand-dark"
          >
            <img src="/google-logo.svg" alt="Google logo" className="w-5 h-5" />
            {t('auth_google')}
          </button>

          <p className="mt-8 text-sm text-center text-gray-500">
            {t('auth_have_account')}{" "}
            <button
              type="button"
              className="text-brand-magenta font-bold hover:underline transition-all"
              onClick={() => {
                if (onSwitch) onSwitch();
                else navigate('/login');
              }}
            >
              {t('auth_login_btn')}
            </button>
          </p>

          <button
            onClick={() => {
              if (onClose) onClose();
              else navigate('/');
            }}
            className="mt-6 w-full py-2.5 text-gray-400 hover:text-brand-dark font-medium transition-colors text-sm"
          >
            {t('auth_close')}
          </button>
        </div>
      </div>
    </>
  );
}