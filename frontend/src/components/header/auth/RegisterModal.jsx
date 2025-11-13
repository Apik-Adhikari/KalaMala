import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
          localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.username, email: data.email }));
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
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="tel"
              name="phone"
              placeholder="+97798XXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />

            <button
              type="submit"
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="mt-3 w-full py-2 border rounded hover:bg-gray-100 flex items-center justify-center gap-2"
          >
            <img src="/google-logo.svg" alt="Google logo" className="w-5 h-5" />
            Sign up with Google
          </button>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-600 font-medium underline"
                onClick={() => {
                  if (onSwitch) onSwitch();
                  else navigate('/login');
                }}
              >
                Login
              </button>
            </p>

            <button
              onClick={() => {
                if (onClose) onClose();
                else navigate('/');
              }}
              className="mt-4 w-full py-2 border rounded hover:bg-gray-100"
            >
              Close
            </button>
        </div>
      </div>
    </>
  );
}