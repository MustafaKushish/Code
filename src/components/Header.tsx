import React, { useEffect, useRef, useState } from 'react';
import { Microscope, Calendar, Phone, MessageSquare, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#diagnose', label: 'Preise', index: '01' },
  { href: '#status', label: 'Auftragsstatus', index: '02' },
  { href: '#services', label: 'Leistungen', index: '03' },
  { href: '#ablauf', label: 'Ablauf', index: '04' },
  { href: '#kontakt', label: 'Kontakt', index: '09' },
];

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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStatusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenStatusTracker();
  };
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
      <div
        className={`max-w-7xl mx-auto backdrop-blur-xl border rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 transition-all duration-300 ${
          scrolled
            ? 'bg-[#070C0E]/92 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
            : 'bg-[#080E10]/70 border-[#00F5D4]/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
        }`}
      >
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
            <span className="hidden sm:block text-[8px] sm:text-[9px] font-mono text-zinc-400 tracking-wider">CHIP-LEVEL · NEUMARKT</span>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm text-zinc-300" aria-label="Hauptnavigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={link.href === '#status' ? handleStatusClick : undefined}
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              {link.href === '#status' && <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="tel:+4917641744443"
            title="Jetzt in der Werkstatt anrufen"
            aria-label="Anrufen: 0176 4174 4443"
            className="hidden md:inline-flex w-9 h-9 items-center justify-center rounded-xl text-zinc-200 bg-white/5 border border-white/10 hover:border-[#00F5D4]/60 hover:text-[#00F5D4] transition-all"
          >
            <Phone className="w-4 h-4" />
          </a>

          <a
            href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20habe%20eine%20Reparatur-Anfrage."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-semibold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/40 hover:bg-[#25D366] hover:text-[#04140A] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Cal.com Termin – Hauptaktion */}
          <button
            type="button"
            data-cal-link="mustafa-al-zurgany-cfwhg8/code-werkstatt"
            data-cal-config='{"layout":"month_view","theme":"dark"}'
            className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-xl text-sm font-semibold text-[#160B04] bg-gradient-to-b from-[#FFA060] to-[#D9783E] hover:brightness-110 shadow-[0_6px_20px_rgba(217,120,62,0.35)] transition-all cursor-pointer shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Termin</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            className="lg:hidden inline-flex w-9 h-9 items-center justify-center rounded-xl text-zinc-200 bg-white/5 border border-white/10 hover:border-[#00F5D4]/60 transition-all cursor-pointer"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden max-w-7xl mx-auto mt-2 bg-[#080E10]/98 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                setMenuOpen(false);
                if (link.href === '#status') handleStatusClick(e);
              }}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-[15px] text-zinc-200 hover:bg-white/5"
            >
              <span>{link.label}</span>
              <span className="font-mono text-[11px] text-[#FF8D4D]">{link.index}</span>
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onOpenAiChat();
            }}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-[15px] text-[#00F5D4] hover:bg-white/5 cursor-pointer"
          >
            <Microscope className="w-4 h-4" />
            <span>KI-Techniker fragen</span>
          </button>
        </div>
      )}
    </header>
  );
};
