import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-brand-dark mb-6">{t('about_title')}</h1>
        <div className="h-1 w-24 bg-brand-magenta mx-auto rounded-full"></div>
      </div>

      <div className="space-y-8 text-lg text-gray-600 leading-relaxed font-light">
        <p>
          <strong className="text-brand-dark font-medium">KalaMala</strong> {t('about_p1')}
        </p>

        <p>
          {t('about_p2')}
        </p>

        <div className="bg-brand-gray/30 p-8 rounded-2xl md:-mx-8 border border-brand-gray/50 my-12">
          <p className="italic text-xl text-brand-dark font-serif text-center">
            "{t('about_quote')}"
          </p>
        </div>

        <p className="text-sm text-gray-500 pt-8 border-t border-brand-gray/30">
          {t('about_footer')}
        </p>
      </div>
    </div>
  );
}
