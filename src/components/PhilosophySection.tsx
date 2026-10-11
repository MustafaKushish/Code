import React from 'react';
import { Leaf, TrendingDown, Scale } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';
import { msg, useI18n } from '../i18n';

const STATS = [
  { value: '60–85 %', label: msg('günstiger als ein Neugerät'), accent: '#FF8D4D' },
  { value: msg('bis 99 %'), label: msg('des Geräts bleiben im Kreislauf'), accent: '#00F5D4' },
  { value: '> 75 %', label: msg('des CO₂ entstehen schon bei der Herstellung'), accent: '#7FE3C8' },
];

const PRINCIPLES = [
  {
    title: msg('Ressourcen schonen'),
    text: msg('Statt ganzer Platinen tauschen wir einzelne SMD- und BGA-Bauteile. Das vermeidet Elektroschrott und erhält dein Gerät.'),
    Icon: Leaf,
    color: '#00F5D4',
  },
  {
    title: msg('Geld sparen'),
    text: msg('Die meisten Defekte sitzen in einem kleinen Bauteil oder einer Buchse – nicht im ganzen Gerät. Genau da setzen wir an.'),
    Icon: TrendingDown,
    color: '#FF8D4D',
  },
  {
    title: msg('Ehrlich beraten'),
    text: msg('Lohnt sich eine Reparatur nicht oder hält sie nicht dauerhaft, sagen wir dir das klar – bevor Kosten entstehen.'),
    Icon: Scale,
    color: '#F3F7F7',
  },
];

export const PhilosophySection: React.FC = () => {
  const { t } = useI18n();
  return (
    <section id="haltung" className="py-16 md:py-24 relative section-band">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          index="06"
          eyebrow={t('Haltung')}
          title={t('Werterhalt statt Wegwerfen')}
          intro={t('Ein defektes Bauteil ist selten ein Totalschaden. Reparieren spart Geld, Daten und Rohstoffe.')}
        />

        <div className="reveal grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-white/[0.08] bg-[#0B1315]/80 divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-white/[0.08] mb-6 overflow-hidden">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 sm:p-8 text-center">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: s.accent }}>
                {t(s.value)}
              </div>
              <div className="mt-1 text-sm text-[#94A9AA]">{t(s.label)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PRINCIPLES.map(({ title, text, Icon, color }) => (
            <div key={title} className="reveal rounded-2xl border border-white/[0.08] bg-[#0B1315]/60 p-6">
              <Icon className="w-6 h-6 mb-4" style={{ color }} strokeWidth={1.6} />
              <h3 className="text-base font-semibold text-white mb-1.5">{t(title)}</h3>
              <p className="text-sm text-[#94A9AA] leading-relaxed">{t(text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
