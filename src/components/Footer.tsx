import React, { useRef } from 'react';
import { ClipboardCheck } from 'lucide-react';

interface FooterProps {
  onOpenCheckIn: () => void;
  onOpenLegal: (type: 'impressum' | 'datenschutz') => void;
  onOpenSecretModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCheckIn, onOpenLegal, onOpenSecretModal }) => {
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
    <footer className="border-t border-[#C9743F]/25 bg-[#040708] py-12 text-xs text-[#839897] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Logo ganz unten links: Nur bei 5-maligem Klicken wird der Manager geöffnet */}
          <div
            onClick={handleBottomLogoClick}
            className="flex items-center gap-3 text-center md:text-left cursor-pointer select-none group"
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
              <span className="text-base font-extrabold text-white tracking-wider group-hover:text-[#00F5D4] transition-colors">
                CODE
              </span>
              <span className="text-[#00F5D4] ml-2">• Mustafa Al-Zurgany</span>
              <p className="text-[11px] text-[#839897] mt-0.5">Spezial-Werkstatt für Platinenreparaturen Neumarkt i.d.OPf.</p>
            </div>
          </div>

          <div className="text-[#FF8D4D] text-xs sm:text-sm font-semibold text-center">
            »Reparieren statt Neukaufen, CODE bringt's zum Laufen.«
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenCheckIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all font-bold cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Digitaler Check-In &amp; DSGVO</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLegal('impressum')}
              className="hover:text-[#00F5D4] transition-colors cursor-pointer"
            >
              Impressum
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('datenschutz')}
              className="hover:text-[#00F5D4] transition-colors cursor-pointer"
            >
              Datenschutz
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#556968]">
          <p>© {new Date().getFullYear()} CODE // Alle Rechte vorbehalten. Handwerkskunst auf Bauteilebene.</p>
          <p>92318 Neumarkt in der Oberpfalz • Deutschland</p>
        </div>
      </div>
    </footer>
  );
};
