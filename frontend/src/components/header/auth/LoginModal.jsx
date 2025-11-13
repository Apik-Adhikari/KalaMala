import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ onClose, onSwitch }) {
  const navigate = useNavigate();
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
        // save token and user
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.username, email: data.email }));
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline mb-2"
              onClick={() => alert('Forgot password clicked!')}
            >
              Forgot password?
            </button>
          </div>
          <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{' '}
          <button
            type="button"
            className="text-blue-600 font-medium underline"
            onClick={() => {
              if (onSwitch) {
                onSwitch();
              } else {
                navigate('/register');
              }
            }}
          >
            Register
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
  );
}