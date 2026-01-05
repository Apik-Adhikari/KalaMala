import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gray/50 hover:bg-brand-gray/20 transition-all text-sm font-medium text-brand-dark"
            aria-label="Switch Language"
        >
            <span className={language === 'en' ? 'font-bold text-brand-magenta' : 'text-gray-500'}>EN</span>
            <span className="text-gray-300">|</span>
            <span className={language === 'ne' ? 'font-bold text-brand-magenta' : 'text-gray-500'}>नेपा</span>
        </button>
    );
}
