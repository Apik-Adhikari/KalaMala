import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";

export default function LoginModal({ onClose, onSwitch }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // save token and user in context
        if (data.token) {
          login({ _id: data._id, name: data.username, email: data.email, role: data.role }, data.token);
        }
        onClose && onClose();
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-gray/20">
        <h2 className="text-3xl font-serif font-bold mb-6 text-center text-brand-dark">{t('auth_login_title')}</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder={t('auth_email')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={t('auth_password')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg text-center">{error}</div>}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-brand-magenta hover:text-pink-700 font-medium transition-colors"
              onClick={() => alert('Forgot password clicked!')}
            >
              {t('auth_forgot')}
            </button>
          </div>

          <button
            className="bg-brand-magenta text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-brand-magenta/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? t('auth_logging_in') : t('auth_login_btn')}
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-gray-500">
          {t('auth_no_account')}{' '}
          <button
            type="button"
            className="text-brand-magenta font-bold hover:underline transition-all"
            onClick={() => {
              if (onSwitch) {
                onSwitch();
              } else {
                navigate('/register');
              }
            }}
          >
            {t('auth_register_btn')}
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
  );
}