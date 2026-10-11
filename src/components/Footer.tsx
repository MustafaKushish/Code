import React, { useRef } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { msg, useI18n } from '../i18n';

interface FooterProps {
  onOpenCheckIn: () => void;
  onOpenLegal: (type: 'impressum' | 'datenschutz') => void;
  onOpenSecretModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCheckIn, onOpenLegal, onOpenSecretModal }) => {
  const { t } = useI18n();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBottomLogoClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    // Genau 5-maliges Klicken auf das Logo ganz unten links öffnet die geheime Managerseite
    if (clickCountRef.current >= 5) {
      e.preventDefault();
      clickCountRef.current = 0;
      onOpenSecretModal();
    }
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#040708] pt-14 pb-8 text-sm text-[#839897]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/5">
          {/* Logo: 5-maliges Klicken öffnet den Werkstatt-Zugang */}
          <div className="md:col-span-5 space-y-4">
            <div
              onClick={handleBottomLogoClick}
              className="inline-flex items-center gap-3 cursor-pointer select-none group"
              title="CODE IT-Werkstatt Neumarkt"
            >
              <svg
                className="w-9 h-9 drop-shadow-[0_0_8px_rgba(201,116,63,0.4)] transition-transform group-hover:scale-105 shrink-0"
                viewBox="0 0 500 500"
              >
                <rect width="500" height="500" rx="100" fill="#10191A" />
                <rect x="100" y="100" width="300" height="300" rx="40" fill="#182322" stroke="#C9743F" strokeWidth="16" />
                <path
                  d="M 200 60 V 100 M 250 60 V 100 M 300 60 V 100 M 200 400 V 440 M 250 400 V 440 M 300 400 V 440 M 60 200 H 100 M 60 250 H 100 M 60 300 H 100 M 400 200 H 440 M 400 250 H 440 M 400 300 H 440"
                  stroke="#C9743F"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 190 200 L 140 250 L 190 300 M 310 200 L 360 250 L 310 300"
                  stroke="#4FA39B"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <line x1="270" y1="190" x2="230" y2="310" stroke="#C9743F" strokeWidth="24" strokeLinecap="round" />
              </svg>
              <div>
                <span className="block text-lg font-bold text-white tracking-wider group-hover:text-[#00F5D4] transition-colors">CODE</span>
                <span className="block text-xs text-[#839897]">{t('IT-Werkstatt')} · Mustafa Al-Zurgany</span>
              </div>
            </div>
            <p className="max-w-sm leading-relaxed">
              {t('Spezial-Werkstatt für Platinenreparatur, Mikrolöten und Datenrettung in Neumarkt in der Oberpfalz.')}
            </p>
            <p className="font-mono text-[13px] text-[#E5A96A]">{t("»Reparieren statt Neukaufen, CODE bringt's zum Laufen.«")}</p>
          </div>

          <nav className="md:col-span-3" aria-label={t('Footer-Navigation')}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F5D4] mb-4">{t('Seiten')}</h3>
            <ul className="space-y-2.5">
              {[
                ['#diagnose', msg('Preise & Diagnose')],
                ['#status', msg('Auftragsstatus')],
                ['#services', msg('Leistungen')],
                ['#b2b', msg('Für Händler (B2B)')],
                ['#faq', msg('Häufige Fragen')],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="hover:text-white transition-colors">
                    {t(label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00F5D4] mb-4">{t('Kontakt')}</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="tel:+4917641744443" dir="ltr" className="text-white hover:text-[#00F5D4] transition-colors">
                  0176 4174 4443
                </a>
              </li>
              <li>
                <a href="mailto:mustafa.alzurgany@gmail.com" className="hover:text-white transition-colors break-all">
                  mustafa.alzurgany@gmail.com
                </a>
              </li>
              <li>{t('Mo–Fr 10–18 Uhr · Sa 10–14 Uhr')}</li>
              <li>{t('92318 Neumarkt i.d.OPf.')}</li>
            </ul>
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#00F5D4]/35 bg-[#00F5D4]/10 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#04110F] transition-all font-semibold cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{t('Digitaler Check-In')}</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F7473]">
          <p>© {new Date().getFullYear()} CODE IT-Werkstatt · {t('Handwerk auf Bauteilebene')}</p>
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => onOpenLegal('impressum')} className="hover:text-white transition-colors cursor-pointer">
              {t('Impressum')}
            </button>
            <button type="button" onClick={() => onOpenLegal('datenschutz')} className="hover:text-white transition-colors cursor-pointer">
              {t('Datenschutz')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
