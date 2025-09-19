


import { User } from "lucide-react";
import { useState } from "react";

export default function UserMenu() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setIsLoginOpen(true);
          setIsRegisterOpen(false);
        }}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <span className="material-icons"><User /></span>
      </button>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
              />
              <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Login
              </button>
            </form>
            <p className="mt-4 text-sm text-center">
              Don’t have an account?{' '}
              <button
                type="button"
                className="text-blue-600 font-medium underline"
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsRegisterOpen(true);
                }}
              >
                Register
              </button>
            </p>
            <button
              onClick={() => setIsLoginOpen(false)}
              className="mt-4 w-full py-2 border rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
            <form className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username"
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="border p-2 rounded"
              />
              <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Register
              </button>
            </form>
            <p className="mt-4 text-sm text-center">
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-600 font-medium underline"
                onClick={() => {
                  setIsRegisterOpen(false);
                  setIsLoginOpen(true);
                }}
              >
                Login
              </button>
            </p>
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="mt-4 w-full py-2 border rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
