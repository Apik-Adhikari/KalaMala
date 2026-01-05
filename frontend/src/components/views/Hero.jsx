import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Hero({ user }) {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="relative bg-brand-light overflow-hidden mb-16 rounded-3xl mx-4 md:mx-0">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-72 h-72 bg-brand-magenta/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-8 py-20 md:py-32 relative z-10 flex flex-col items-center text-center">
                <span className="text-brand-magenta font-bold tracking-widest text-sm uppercase mb-4 animate-fade-in">
                    {t('hero_welcome')}
                </span>

                <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark mb-6 leading-tight tracking-tight">
                    {t('hero_title_1')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-magenta to-brand-yellow">
                        {t('hero_title_2')}
                    </span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                    {user?.name
                        ? t('hero_subtitle_user', { name: user.name })
                        : t('hero_subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/products')}
                        className="px-8 py-4 bg-brand-dark text-white rounded-xl font-bold hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                        {t('hero_shop')}
                    </button>
                    <button
                        onClick={() => navigate('/about')}
                        className="px-8 py-4 bg-white text-brand-dark border-2 border-brand-gray rounded-xl font-bold hover:bg-brand-gray/20 transition-all duration-300"
                    >
                        {t('hero_story')}
                    </button>
                </div>
            </div>
        </div>
    );
}
