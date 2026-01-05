import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="hover:opacity-90">
      <img src="/kalamalalogo.png" alt="KalaMala" className="h-14 w-auto object-contain" />
    </Link>
  );
}