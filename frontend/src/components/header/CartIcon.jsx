import { ShoppingCart } from "lucide-react";

export default function CartIcon({ count = 0 }) {
  return (
    <div className="relative group cursor-pointer p-2 rounded-full hover:bg-brand-gray/50 transition-all duration-300">

      <ShoppingCart className="w-6 h-6 text-brand-dark group-hover:text-brand-magenta transition-colors" />


      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-brand-yellow text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
          {count}
        </span>
      )}
    </div>
  );
}