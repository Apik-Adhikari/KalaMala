import Logo from "./Logo.jsx";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow">
      <Logo />
    </header>
  );
}