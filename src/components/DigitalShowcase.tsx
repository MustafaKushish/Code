import React from 'react';
import { BellRing, CalendarCheck, Check, Receipt, TrendingUp } from 'lucide-react';
import { msg, useI18n } from '../i18n';

// Schwebende App-Vorschau im Hero von CODE Digital: zeigt, wie ein fertiges System aussieht.
// Alle Zahlen und Namen sind Beispielwerte.

const BARS = [38, 52, 44, 68, 59, 82, 74];
const DAYS = [msg('Mo'), msg('Di'), msg('Mi'), msg('Do'), msg('Fr'), msg('Sa'), msg('So')];

const SLOTS = [
  { time: '09:30', name: 'Lena K.', what: msg('Haarschnitt'), done: true },
  { time: '11:00', name: 'Murat Y.', what: msg('Bart & Schnitt'), done: true },
  { time: '14:30', name: 'Sara B.', what: msg('Färben'), done: false },
];

export const HeroMockup: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-[520px] aspect-[5/5.6] sm:aspect-[5/4.4] select-none" aria-hidden="true">
      <div className="glow-blob w-64 h-64 bg-[#00F5D4] -top-6 start-6" />
      <div className="glow-blob w-56 h-56 bg-[#FF8D4D] bottom-0 end-0 [animation-delay:-6s]" />

      {/* Dashboard-Fenster */}
      <div className="glass float-a absolute top-[4%] start-0 w-[78%] rounded-2xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <span className="ms-3 text-[10px] font-mono text-zinc-400">dein-laden.de/system</span>
        </div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[11px] text-zinc-400">{t('Umsatz diese Woche')}</p>
            <p className="text-2xl font-bold text-white" dir="ltr">4.180 €</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00F5D4] bg-[#00F5D4]/10 rounded-full px-2 py-0.5">
            <TrendingUp className="w-3 h-3" /> +18 %
          </span>
        </div>
        <div className="flex items-end gap-2">
          {BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="bar-grow w-full rounded-md bg-gradient-to-t from-[#00F5D4]/30 to-[#00F5D4]"
                style={{ height: `${Math.round(h * 0.9)}px`, animationDelay: `${0.15 * i}s` }}
              />
              <span className="text-[9px] text-zinc-500">{t(DAYS[i])}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Handy mit Terminen */}
      <div className="glass glass-solid float-b absolute bottom-0 end-0 sm:end-[2%] w-[54%] sm:w-[46%] rounded-[1.6rem] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="mx-auto w-14 h-1.5 rounded-full bg-white/15 mb-3" />
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white mb-2">
          <CalendarCheck className="w-3.5 h-3.5 text-[#FF8D4D]" />
          {t('Termine heute')}
        </p>
        <ul className="space-y-1.5">
          {SLOTS.map((s) => (
            <li key={s.time} className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-2 py-1.5">
              <span className="text-[10px] font-mono text-[#FFB98A]" dir="ltr">{s.time}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[10px] text-white truncate">{s.name}</span>
                <span className="block text-[9px] text-zinc-400 truncate">{t(s.what)}</span>
              </span>
              {s.done && <Check className="w-3 h-3 text-[#00F5D4]" strokeWidth={3} />}
            </li>
          ))}
        </ul>
      </div>

      {/* Kassenbon */}
      <div className="glass glass-solid float-c absolute top-[60%] sm:top-[52%] start-[2%] sm:start-[4%] w-[40%] sm:w-[36%] rounded-xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-white mb-2">
          <Receipt className="w-3.5 h-3.5 text-[#00F5D4]" />
          {t('Bon')} #1043
        </p>
        <div className="space-y-1 text-[9px] text-zinc-300 font-mono" dir="ltr">
          <div className="flex justify-between"><span>Cappuccino</span><span>3,60</span></div>
          <div className="flex justify-between"><span>Croissant</span><span>2,40</span></div>
          <div className="flex justify-between border-t border-dashed border-white/15 pt-1 text-white font-bold">
            <span>Σ</span><span>6,00 €</span>
          </div>
        </div>
        <p className="mt-1.5 text-[8px] text-[#00F5D4] font-mono">TSE ✓</p>
      </div>

      {/* Benachrichtigung */}
      <div className="toast-in absolute top-[30%] sm:top-[38%] end-0 glass glass-solid rounded-xl px-3 py-2 flex items-center gap-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
        <span className="w-7 h-7 rounded-lg bg-[#FF8D4D]/20 text-[#FF8D4D] flex items-center justify-center">
          <BellRing className="w-3.5 h-3.5" />
        </span>
        <span>
          <span className="block text-[10px] font-semibold text-white">{t('Neue Online-Buchung')}</span>
          <span className="block text-[9px] text-zinc-400" dir="ltr">Sa · 10:00</span>
        </span>
      </div>
    </div>
  );
};

/** Laufband mit Bausteinen – zwei Reihen in Gegenrichtung */
export const Marquee: React.FC<{ items: React.ReactNode[]; reverse?: boolean }> = ({ items, reverse }) => (
  <div className="marquee overflow-hidden">
    <div className={`marquee-track flex w-max gap-3 ${reverse ? 'reverse' : ''}`}>
      {[...items, ...items].map((it, i) => (
        <div key={i} aria-hidden={i >= items.length || undefined}>
          {it}
        </div>
      ))}
    </div>
  </div>
);

/** Setzt die Mausposition als CSS-Variablen für den Lichtschein der Karten */
export const trackSpotlight = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};
