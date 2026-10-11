import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';

export const ReviewsSection: React.FC = () => {
  const { t } = useI18n();
  return (
    <section id="bewertungen" className="py-12 md:py-16 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="reveal relative overflow-hidden rounded-3xl border border-[#FF8D4D]/25 bg-gradient-to-br from-[#1A120D]/80 via-[#0B1315]/90 to-[#0B1315]/90 p-7 sm:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex gap-1 text-[#FFB547] shrink-0" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 fill-current" strokeWidth={0} />
            ))}
          </div>
          <div className="flex-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF8D4D] mb-2">05 — {t('Bewertungen')}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">{t('Warst du schon bei CODE in Neumarkt?')}</h2>
            <p className="text-sm text-[#94A9AA] leading-relaxed">
              {t('Eine kurze Google-Bewertung dauert eine Minute und hilft der nächsten Person mit kaputtem Gerät bei der Entscheidung.')}
            </p>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=CODE+Neumarkt"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-white text-[#0A1112] hover:bg-[#FFE7D2] transition-colors"
          >
            <span>{t('Bei Google bewerten')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
