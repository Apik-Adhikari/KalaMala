import { User } from "lucide-react";
import { useState } from "react";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <span className="material-icons">< User /></span>
      </button>

      {/* Login/Register Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Login / Register</h2>
            
            {/* Login form */}
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

            {/* Register link */}
            <p className="mt-4 text-sm text-center">
              Don’t have an account?{" "}
              <a href="/register" className="text-blue-600 font-medium">
                Register
              </a>
            </p>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
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