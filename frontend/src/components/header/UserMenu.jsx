import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
  const navigate = useNavigate();

  return (
    <div>
      {/* User Icon */}
      <button
        onClick={() => navigate('/login')}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <User className="w-6 h-6" />
      </button>

      {/* Register link (example, you can style or position as needed) */}
      <button
        onClick={() => navigate('/register')}
        className="ml-2 text-blue-600 underline text-sm"
      >
        
      </button>
    </div>
  );
}
