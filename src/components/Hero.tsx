import React, { useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  ShieldCheck,
  MapPin,
  BadgeEuro,
  DatabaseBackup,
  Truck,
} from 'lucide-react';
import { DeviceCategoryKey } from '../types';
import { DeviceExplorer } from './DeviceExplorer';
import { RepairCounter } from './RepairCounter';
import { getOpeningStatus } from '../utils/openingHours';
import { msg, useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';
import { Marquee } from './DigitalShowcase';

const MARQUEE = [
  'PlayStation 5',
  'Xbox Series X',
  'Nintendo Switch',
  'DualSense',
  'MacBook',
  'iPhone',
  'Samsung Galaxy',
  'Gaming-PC',
  'ThinkPad',
  'BMW · VW · Audi',
  'iPad',
  'SSD & HDD',
];

const PROMISES = [
  { text: msg('Festpreis vor Arbeitsbeginn'), Icon: BadgeEuro },
  { text: msg('6 Monate Garantie'), Icon: ShieldCheck },
  { text: msg('No Data – No Fee'), Icon: DatabaseBackup },
  { text: msg('Versand deutschlandweit'), Icon: Truck },
];

// Die Geräte-Bühne richtet sich beim Scrollen auf (wie bei Produktseiten)
function useScrollTilt() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 = Bühne kommt gerade unten ins Bild, 1 = Bühne steht im oberen Drittel
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      el.style.setProperty('--tilt', String(1 - p));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

interface HeroProps {
  onSelectCategory: (cat: DeviceCategoryKey) => void;
  onOpenAiChat: (initialQuery?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, onOpenAiChat }) => {
  const { t } = useI18n();
  const opening = getOpeningStatus(t);
  const stageRef = useScrollTilt();
  return (
    <section className="relative pt-6 pb-10 md:pt-16 md:pb-16">
      {/* Aurora-Hintergrund mit feinem Raster */}
      <div aria-hidden="true" className="absolute -top-28 inset-x-0 bottom-0 overflow-hidden pointer-events-none">
        <div className="aurora" />
        <div className="hero-grid" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center flex flex-col items-center">
          <div className="hero-in flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border backdrop-blur ${
                opening.open
                  ? 'text-[#7CF5C4] bg-[#00F5D4]/10 border-[#00F5D4]/30'
                  : 'text-[#FFB98A] bg-[#FF8D4D]/10 border-[#FF8D4D]/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${opening.open ? 'bg-[#00F5D4] animate-pulse' : 'bg-[#FF8D4D]'}`} />
              {opening.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur">
              <MapPin className="w-3.5 h-3.5 text-[#FF8D4D]" />
              <bdi dir="ltr">Neumarkt i.d.OPf.</bdi>
            </span>
            <RepairCounter />
          </div>

          <h1 className="hero-in [animation-delay:80ms] mt-6 sm:mt-8 text-[2.6rem] leading-[1] sm:text-7xl lg:text-[5.75rem] font-bold tracking-[-0.045em] text-balance max-w-5xl">
            <span className="hero-title">{t('Präzision bis auf')}</span>{' '}
            <span className="text-shine">{t('Bauteilebene.')}</span>
          </h1>
          <p className="hero-in [animation-delay:160ms] mt-5 sm:mt-7 text-zinc-300 text-base sm:text-xl leading-relaxed max-w-2xl text-balance">
            {t('Chip-Level-Reparatur für Konsolen, Laptops, MacBooks, Autoschlüssel und Datenrettung – unter dem Mikroskop, mit Festpreis vor Arbeitsbeginn.')}
          </p>
          <p className="hero-in [animation-delay:200ms] mt-3 text-sm text-[#E5A96A]">{t("»Reparieren statt Neukaufen, CODE bringt's zum Laufen.«")}</p>

          {/* CTAs */}
          <div className="hero-in [animation-delay:240ms] mt-7 sm:mt-9 flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
            <a
              href={whatsappLink(t('Hallo Mustafa, ich habe ein defektes Gerät und möchte eine Reparatur anfragen.'))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-7 rounded-full text-[15px] font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 shadow-[0_10px_40px_rgba(37,211,102,0.35)] transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span>{t('Anfrage per WhatsApp')}</span>
            </a>
            <button
              type="button"
              onClick={() => onOpenAiChat()}
              className="inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-7 rounded-full text-[15px] font-semibold text-white border border-white/15 bg-white/[0.05] backdrop-blur hover:border-[#00F5D4]/70 hover:bg-[#00F5D4]/[0.08] transition-all cursor-pointer active:scale-[0.98]"
            >
              <Bot className="w-5 h-5 text-[#00F5D4] shrink-0" />
              <span>{t('KI-Techniker fragen')}</span>
            </button>
          </div>

          {/* Versprechen */}
          <ul className="hero-in [animation-delay:300ms] mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-zinc-400">
            {PROMISES.map(({ text, Icon }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-[#00F5D4] shrink-0" strokeWidth={1.75} />
                <span>{t(text)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interaktives Gerät als Bühne unter der Überschrift */}
        <div ref={stageRef} className="hero-in [animation-delay:380ms] mt-10 sm:mt-14 max-w-5xl mx-auto [perspective:1600px]">
          <div className="showcase-tilt">
            <DeviceExplorer onSelectCategory={onSelectCategory} />
          </div>
        </div>

        {/* Laufband: Geräte, die wir reparieren */}
        <div className="mt-12 md:mt-16" aria-label={t('Geräte, die wir reparieren')}>
          <Marquee
            items={MARQUEE.map((m) => (
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-200 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
                {m}
              </span>
            ))}
          />
        </div>
      </div>
    </section>
  );
};
