import CartIcon from "./CartIcon.jsx";
import Logo from "./Logo.jsx";
import NavMenu from "./NavMenu.jsx";
import SearchBar from "./SearchBar.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Header() {
  return (
    <header className="bg-blue-300 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
        <Logo />
        <SearchBar />
        <NavMenu />
        <div className="flex items-center gap-4">
          <CartIcon />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}