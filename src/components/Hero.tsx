import React from 'react';
import {
  MessageSquare,
  Bot,
  ShieldCheck,
  MapPin,
  Laptop,
  Gamepad2,
  Joystick,
  KeyRound,
  Smartphone,
  ArrowDown,
  BadgeEuro,
  DatabaseBackup,
  Truck,
} from 'lucide-react';
import { DeviceCategoryKey } from '../types';
import { LogicBoardScanner } from './LogicBoardScanner';
import { RepairCounter } from './RepairCounter';
import { getOpeningStatus } from '../utils/openingHours';
import { msg, useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';

const DEVICES: { key: DeviceCategoryKey; label: string; Icon: typeof Laptop }[] = [
  { key: 'laptop_pc', label: msg('Laptop'), Icon: Laptop },
  { key: 'konsole', label: msg('Konsole'), Icon: Gamepad2 },
  { key: 'controller', label: msg('Controller'), Icon: Joystick },
  { key: 'schluessel', label: msg('Schlüssel'), Icon: KeyRound },
  { key: 'phone', label: msg('Handy'), Icon: Smartphone },
];

const PROMISES = [
  { text: msg('Festpreis vor Arbeitsbeginn'), Icon: BadgeEuro },
  { text: msg('6 Monate Garantie'), Icon: ShieldCheck },
  { text: msg('No Data – No Fee'), Icon: DatabaseBackup },
  { text: msg('Versand deutschlandweit'), Icon: Truck },
];

interface HeroProps {
  onSelectCategory: (cat: DeviceCategoryKey) => void;
  onOpenAiChat: (initialQuery?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, onOpenAiChat }) => {
  const { t } = useI18n();
  const opening = getOpeningStatus(t);
  return (
    <section className="pt-4 pb-14 md:pt-10 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headlines & Call-to-Actions */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  opening.open
                    ? 'text-[#7CF5C4] bg-[#00F5D4]/10 border-[#00F5D4]/30'
                    : 'text-[#FFB98A] bg-[#FF8D4D]/10 border-[#FF8D4D]/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opening.open ? 'bg-[#00F5D4] animate-pulse' : 'bg-[#FF8D4D]'}`} />
                {opening.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
                <MapPin className="w-3.5 h-3.5 text-[#FF8D4D]" />
                <bdi dir="ltr">Neumarkt i.d.OPf.</bdi>
              </span>
              <RepairCounter />
            </div>

            <div className="space-y-4">
              <h1 className="text-[2.35rem] leading-[1.05] sm:text-6xl lg:text-[4rem] font-bold tracking-tight text-balance">
                {t('Präzision bis auf')}{' '}
                <span className="bg-gradient-to-r from-[#00F5D4] via-[#7FE3C8] to-[#FF9D5C] bg-clip-text text-transparent">
                  {t('Bauteilebene.')}
                </span>
              </h1>
              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-xl">
                {t('Chip-Level-Reparatur für Konsolen, Laptops, MacBooks, Autoschlüssel und Datenrettung – unter dem Mikroskop, mit Festpreis vor Arbeitsbeginn.')}
              </p>
              <p className="font-mono text-sm text-[#E5A96A]">{t("»Reparieren statt Neukaufen, CODE bringt's zum Laufen.«")}</p>
            </div>

            {/* Quick-Action: Gerät wählen */}
            <div className="rounded-2xl border border-white/10 bg-[#0A1214]/80 p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="text-sm font-semibold text-white">{t('Was ist kaputt?')}</span>
                <span className="text-xs text-zinc-400">{t('Sofort Preisrahmen sehen ↓')}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DEVICES.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectCategory(key)}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-1 py-3 text-xs font-medium text-zinc-200 hover:text-white hover:border-[#00F5D4]/60 hover:bg-[#00F5D4]/[0.07] transition-all active:scale-95 cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-[#00F5D4] group-hover:scale-110 transition-transform" strokeWidth={1.75} />
                    <span>{t(label)}</span>
                  </button>
                ))}
                <a
                  href="#diagnose"
                  className="sm:hidden flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#FF8D4D]/40 px-1 py-3 text-xs font-medium text-[#FFB98A] hover:bg-[#FF8D4D]/10 transition-all"
                >
                  <ArrowDown className="w-5 h-5" strokeWidth={1.75} />
                  <span>{t('Alle Preise')}</span>
                </a>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <a
                href={whatsappLink(t('Hallo Mustafa, ich habe ein defektes Gerät und möchte eine Reparatur anfragen.'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 shadow-[0_10px_30px_rgba(37,211,102,0.25)] transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span>{t('Anfrage per WhatsApp')}</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenAiChat()}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold text-white border border-white/15 bg-white/[0.04] hover:border-[#00F5D4]/70 hover:bg-[#00F5D4]/[0.08] transition-all cursor-pointer active:scale-[0.98]"
              >
                <Bot className="w-5 h-5 text-[#00F5D4] shrink-0" />
                <span>{t('KI-Techniker fragen')}</span>
              </button>
            </div>

            {/* Versprechen */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px] sm:text-sm text-zinc-300 pt-1">
              {PROMISES.map(({ text, Icon }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#00F5D4] shrink-0" strokeWidth={1.75} />
                  <span>{t(text)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Logic Board Visualizer */}
          <div className="lg:col-span-6">
            <LogicBoardScanner />
          </div>
        </div>
      </div>
    </section>
  );
};
