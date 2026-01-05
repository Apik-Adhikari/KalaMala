import { Search } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchBar() {
  const { t } = useLanguage();

  return (
    <div className="relative hidden md:block w-96 group">
      <input
        type="text"
        placeholder={t('search_placeholder')}
        className="w-full pl-5 pr-12 py-2.5 rounded-full bg-brand-gray/50 border border-transparent focus:bg-white focus:border-brand-magenta/30 focus:ring-4 focus:ring-brand-magenta/10 outline-none transition-all duration-300 font-medium text-brand-dark placeholder-gray-400"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 bottom-1.5 p-2 bg-brand-magenta/90 hover:bg-brand-magenta text-white rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center aspect-square"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}