import { useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyCode() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { login } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [message, setMessage] = useState("");
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only keep last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setStatus("error");
      setMessage("Please enter the complete 6-digit code.");
      return;
    }

    setStatus("verifying");
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/users/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFromUrl, code: fullCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Email verified successfully!");
        // Auto login
        if (data.token) {
          login(
            {
              _id: data._id,
              name: data.fullName,
              email: data.email,
              role: data.role,
            },
            data.token
          );
        }
        setTimeout(() => {
          navigate("/");
        }, 2500);
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An error occurred during verification.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">

        {status === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you to homepage...</p>
            <Link to="/" className="mt-6 inline-block text-brand-magenta font-bold hover:underline">
              Go to Homepage now
            </Link>
          </>
        ) : (
          <>
            {/* Email icon */}
            <div className="w-16 h-16 bg-brand-magenta/10 text-brand-magenta rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-brand-dark mb-2">Verify Your Email</h2>
            <p className="text-gray-500 mb-1 text-sm">We sent a 6-digit code to</p>
            <p className="text-brand-magenta font-semibold mb-6">{emailFromUrl || "your email"}</p>

            {/* Error message */}
            {status === "error" && message && (
              <div className="mb-4 p-3 rounded-xl text-center font-medium bg-red-50 text-red-600 border border-red-200 text-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 6-digit code input */}
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/20 transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={status === "verifying"}
                className="w-full bg-brand-magenta text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-all duration-300 shadow-lg shadow-brand-magenta/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "verifying" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-400">
              Didn't receive the code? Check your spam folder.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
