import React, { useRef } from 'react';
import { Microscope, Calendar, Phone } from 'lucide-react';

interface HeaderProps {
  onOpenSecretModal: () => void;
  onOpenAiChat: () => void;
  onOpenStatusTracker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSecretModal,
  onOpenAiChat,
  onOpenStatusTracker,
}) => {
  const logoClicksRef = useRef(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logoClicksRef.current += 1;
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 1500);

    // 5 fast clicks triggers secret terminal
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      onOpenSecretModal();
    }
  };

  return (
    <header className="sticky top-2 sm:top-3 z-40 mx-2 sm:mx-6 mb-4 sm:mb-6">
      <div className="max-w-7xl mx-auto bg-[#080E10]/95 backdrop-blur-xl border border-[#00F5D4]/25 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(0,245,212,0.08)]">
        {/* Brand Logo with 5x secret backdoor click */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer select-none shrink-0"
          title="CODE IT-Werkstatt Neumarkt (5x klicken für Werkstatt-Manager)"
        >
          <div className="relative shrink-0">
            <svg className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_0_12px_rgba(0,245,212,0.4)] transition-transform group-hover:scale-105" viewBox="0 0 500 500">
              <rect width="500" height="500" rx="100" fill="#0C1517" stroke="#00F5D4" strokeWidth="12" />
              <rect x="100" y="100" width="300" height="300" rx="40" fill="#121F21" stroke="#D48842" strokeWidth="16" />
              <path
                d="M 200 60 V 100 M 250 60 V 100 M 300 60 V 100 M 200 400 V 440 M 250 400 V 440 M 300 400 V 440 M 60 200 H 100 M 60 250 H 100 M 60 300 H 100 M 400 200 H 440 M 400 250 H 440 M 400 300 H 440"
                stroke="#D48842"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 190 200 L 140 250 L 190 300 M 310 200 L 360 250 L 310 300"
                stroke="#00F5D4"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <line x1="270" y1="190" x2="230" y2="310" stroke="#D48842" strokeWidth="24" strokeLinecap="round" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-white">CODE</span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00F5D4]/15 border border-[#00F5D4]/40 text-[#00F5D4] font-bold">
                LAB
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-zinc-400 tracking-wider">CHIP-LEVEL · NEUMARKT</span>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 font-mono text-xs uppercase tracking-wider text-zinc-300">
          <a href="#diagnose" className="hover:text-[#00F5D4] transition-colors">
            Preise &amp; Diagnose
          </a>
          <a href="#services" className="hover:text-[#00F5D4] transition-colors">
            Leistungen
          </a>
          <a
            href="#status"
            onClick={(e) => {
              e.preventDefault();
              onOpenStatusTracker();
            }}
            className="hover:text-[#00F5D4] transition-colors flex items-center gap-1.5 cursor-pointer text-white font-semibold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
            <span>Auftrags-Status</span>
          </a>
          <a href="#b2b" className="hover:text-[#00F5D4] transition-colors">
            B2B
          </a>
          <a href="#kontakt" className="hover:text-[#00F5D4] transition-colors">
            Kontakt
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Status Trigger */}
          <button
            type="button"
            onClick={onOpenStatusTracker}
            className="sm:hidden px-2 py-1.5 text-[11px] font-mono font-bold rounded-lg border border-[#00F5D4]/30 bg-[#00F5D4]/10 text-[#00F5D4] flex items-center gap-1 hover:bg-[#00F5D4] hover:text-black transition-all cursor-pointer"
            title="Auftrags-Status abfragen"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
            <span>Status</span>
          </button>

          {/* Desktop/Tablet WhatsApp */}
          <a
            href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20habe%20eine%20Reparatur-Anfrage."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-[#25D366]/20 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-black transition-all cursor-pointer"
          >
            <span>WhatsApp</span>
          </a>

          {/* Desktop/Tablet Anrufen */}
          <a
            href="tel:+4917641744443"
            title="Jetzt in der Werkstatt anrufen"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-white bg-white/5 border border-white/15 hover:border-[#00F5D4] hover:text-[#00F5D4] hover:bg-[#00F5D4]/10 transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#00F5D4]" />
            <span>Anrufen</span>
          </a>

          {/* Desktop KI Trigger */}
          <button
            type="button"
            onClick={onOpenAiChat}
            className="hidden sm:inline-flex px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#00F5D4] bg-[#4FA39B]/20 text-white hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all shadow-[0_0_12px_rgba(0,245,212,0.25)] items-center gap-1.5 cursor-pointer"
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>KI-Diagnose</span>
          </button>

          {/* Cal.com Appointment button (All screens) */}
          <button
            type="button"
            data-cal-link="mustafa-al-zurgany-cfwhg8/code-werkstatt"
            data-cal-config='{"layout":"month_view","theme":"dark"}'
            className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono font-bold uppercase rounded-lg border border-[#FF8D4D] bg-[#C9743F]/25 text-white hover:bg-[#C9743F] transition-all shadow-[0_0_12px_rgba(201,116,63,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF8D4D]" />
            <span>Termin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
