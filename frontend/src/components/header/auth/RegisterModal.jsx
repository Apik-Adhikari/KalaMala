import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterModal({ onClose, onSwitch }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "+977", // default Nepali code
    password: "",
    confirmPassword: "",
  });
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim phone input
    const trimmedPhone = formData.phone.trim();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setFlash("Passwords do not match!");
      setFlashType("error");
      return;
    }

    // Validate Nepali number (starts with +977 and 10 digits after)
    const nepaliNumberRegex = /^\+977[0-9]{10}$/;
    if (!nepaliNumberRegex.test(trimmedPhone)) {
      setFlash("Please enter a valid Nepali number (e.g. +9779812345678)");
      setFlashType("error");
      return;
    }

    // Use trimmed phone in the data sent to backend
    const registerData = { ...formData, phone: trimmedPhone };

    setLoading(true);
    setFlash("");
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.status === 201) {
        // Redirect to code entry page
        navigate(`/verify-code?email=${encodeURIComponent(data.email || formData.email)}`);
        onClose && onClose();
      } else {
        setFlash(data.message || "Registration failed");
        setFlashType("error");
      }
    } catch (err) {
      setFlash("Registration failed. Please try again.");
      setFlashType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/api/users/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (res.status === 201) {
        // New user — redirect to code entry page
        navigate(`/verify-code?email=${encodeURIComponent(data.email)}`);
        onClose && onClose();
      } else if (res.ok) {
        login({ _id: data._id, name: data.fullName, email: data.email, role: data.role }, data.token);
        onClose && onClose();
        navigate("/");
      } else {
        setFlash(data.message || "Google login failed");
        setFlashType("error");
      }
    } catch (err) {
      setFlash("Google login failed");
      setFlashType("error");
    }
  };

  if (isRegistered) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-gray/20 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to your email. Please verify your account to sign in.
          </p>
          <button
            onClick={() => onSwitch ? onSwitch() : navigate('/login')}
            className="bg-brand-magenta text-white px-6 py-2 rounded-xl font-bold hover:bg-pink-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-gray/20 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-serif font-bold mb-6 text-center text-brand-dark">{t('auth_register_title')}</h2>
          
          {flash && (
            <div className={`mb-6 p-4 rounded-xl text-center font-medium ${flashType === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {flash}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
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

          <div className="mt-4 flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-3">Or signup with</p>
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setFlash("Google Signup Failed");
                  setFlashType("error");
                }}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>
          </div>

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