import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
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
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verify();
  }, [token, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-brand-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we confirm your email address...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you to homepage in 3 seconds...</p>
            <Link to="/" className="mt-6 inline-block text-brand-magenta font-bold hover:underline">
              Go to Homepage now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="bg-brand-magenta text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all inline-block"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
