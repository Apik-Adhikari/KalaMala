import React, { useState } from "react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (!email.trim()) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const responseText = await res.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }
      
      if (res.ok) {
        setSuccessMsg("If an account exists with this email, a password reset link will be sent. Please check your email.");
        setEmail("");
        setTimeout(() => {
          if (onBack) onBack();
        }, 3000);
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError(err?.message ? `An error occurred: ${err.message}` : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-gray/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif font-bold text-brand-dark">Reset Password</h2>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-center font-medium bg-red-50 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl text-center font-medium bg-green-50 text-green-700 border border-green-200">
            {successMsg}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-brand-magenta text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-brand-magenta/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="text-brand-magenta font-bold hover:underline transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
