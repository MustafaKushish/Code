import React from 'react';
import { MessageSquare, PackageOpen, Microscope, BadgeCheck } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';
import { msg, useI18n } from '../i18n';

const STEPS = [
  {
    title: msg('Kontakt aufnehmen'),
    desc: msg('Kurz per WhatsApp oder Anruf Gerät und Fehler beschreiben. Du bekommst sofort eine ehrliche Ersteinschätzung.'),
    Icon: MessageSquare,
  },
  {
    title: msg('Gerät übergeben'),
    desc: msg('Persönlich nach Terminabsprache an der Werkbank in Neumarkt – oder versichert per Post aus ganz Deutschland.'),
    Icon: PackageOpen,
  },
  {
    title: msg('Reparatur & Test'),
    desc: msg('Fehlersuche unter dem Mikroskop, Reparatur am Bauteil und gründlicher Funktionstest. Kosten nur nach deiner Freigabe.'),
    Icon: Microscope,
  },
  {
    title: msg('Abholen & loslegen'),
    desc: msg('Du holst dein getestetes Gerät ab – inklusive 6 Monaten Werkstatt-Garantie auf die Reparatur.'),
    Icon: BadgeCheck,
  },
];

export const WorkflowSection: React.FC = () => {
  const { t } = useI18n();
  return (
    <section id="ablauf" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading index="04" eyebrow={t('Ablauf')} title={t('In vier Schritten wieder startklar')} />

        <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Verbindungslinie (Desktop) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-7 start-[12%] end-[12%] h-px bg-gradient-to-r from-[#00F5D4]/0 via-[#00F5D4]/40 to-[#FF8D4D]/0"
          />
          {STEPS.map(({ title, desc, Icon }, i) => (
            <li
              key={title}
              className="reveal relative rounded-2xl border border-white/[0.08] bg-[#0B1315]/85 p-6 lg:pt-0 lg:border-0 lg:bg-transparent lg:text-center"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="flex lg:flex-col items-center gap-4 lg:gap-5 mb-3 lg:mb-4">
                <div className="relative w-14 h-14 shrink-0 rounded-2xl bg-[#081012] border border-[#00F5D4]/35 flex items-center justify-center text-[#00F5D4] shadow-[0_0_25px_rgba(0,245,212,0.15)]">
                  <Icon className="w-6 h-6" strokeWidth={1.6} />
                  <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-[#D9783E] text-[#160B04] text-[11px] font-mono font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{t(title)}</h3>
              </div>
              <p className="text-sm text-[#94A9AA] leading-relaxed lg:max-w-[16rem] lg:mx-auto">{t(desc)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
