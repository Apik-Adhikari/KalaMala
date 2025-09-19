import { ShoppingCart } from "lucide-react";

export default function CartIcon({ count = 0 }) {
  return (
    <div className="">
      
      <ShoppingCart className="" />

      
      {count > 0 && (
        <span className="">
          {count}
        </span>
      )}
    </div>
  );
}