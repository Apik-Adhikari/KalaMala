import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useSearch } from "../../context/SearchContext";

export default function SearchBar() {
  const { t } = useLanguage();
  const { searchQuery, updateSearchQuery } = useSearch();
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update global search context with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, updateSearchQuery]);

  // Handle dropdown results (optional, but keeping it for UX)
  useEffect(() => {
    if (localQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products?search=${localQuery}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 5));
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSelect = (productId) => {
    navigate(`/products/${productId}`);
    setLocalQuery("");
    setIsOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // For live filtering, we stay on the same page or navigate to products
      // if not already there, but the requirement says "Do not reload the page"
      // and "Display the filtered products dynamically in the product grid".
      // Usually this means if they are on Home, stay on Home and filter.
      // If we are already using context, ProductList will react to it.
      setIsOpen(false);
    }
  };

  return (
    <div className="relative hidden md:block w-96 group" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => localQuery.length >= 2 && setIsOpen(true)}
          placeholder={t('search_placeholder')}
          className="w-full pl-5 pr-12 py-2.5 rounded-full bg-brand-gray/50 border border-transparent focus:bg-white focus:border-brand-magenta/30 focus:ring-4 focus:ring-brand-magenta/10 outline-none transition-all duration-300 font-medium text-brand-dark placeholder-gray-400"
        />
        <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1">
          {localQuery && (
            <button
              type="button"
              onClick={() => { setLocalQuery(""); setResults([]); setIsOpen(false); }}
              className="p-2 text-gray-400 hover:text-brand-magenta transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="p-2 bg-brand-magenta/90 hover:bg-brand-magenta text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center aspect-square"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-brand-gray/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-brand-gray/30">
                Products
              </div>
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSelect(product._id)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-brand-gray/30 transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-brand-gray/50">
                    <img
                      src={product.image || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-brand-dark truncate group-hover:text-brand-magenta transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                  </div>
                  <div className="text-sm font-bold text-brand-magenta">
                    Rs. {product.price}
                  </div>
                </button>
              ))}
              <div
                onClick={handleSearchSubmit}
                className="w-full py-3 px-4 text-center text-sm font-medium text-brand-magenta hover:bg-brand-gray/30 transition-colors border-t border-brand-gray/30 cursor-pointer"
              >
                View all results for "{localQuery}"
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No products found for "{localQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}