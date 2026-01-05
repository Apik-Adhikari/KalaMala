import { useLanguage } from "../../context/LanguageContext";

export default function NavMenu() {
  const { t } = useLanguage();

  return (
    <nav>
      <ul className="flex gap-8 items-center">
        <li>
          <a href="/seller" className="text-sm font-medium text-brand-dark hover:text-brand-magenta transition-colors">
            {t('nav_sell')}
          </a>
        </li>
        <li>
          <a href="/about" className="text-sm font-medium text-brand-dark hover:text-brand-magenta transition-colors">
            {t('nav_about')}
          </a>
        </li>
      </ul>
    </nav>
  );
}