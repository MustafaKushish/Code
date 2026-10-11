import React from 'react';
import { Check, Laptop, Gamepad2, KeyRound, HardDrive, Microscope, Smartphone, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';
import { msg, useI18n } from '../i18n';

interface ServiceCard {
  title: string;
  text: string;
  /** [fett gedruckter Anfang oder leer, Rest] */
  points: [string, string][];
  tag: string;
  Icon: LucideIcon;
  accent: 'teal' | 'orange';
}

const CARDS: ServiceCard[] = [
  {
    title: msg('Laptop, MacBook & PC-Systeme'),
    text: msg('Präzise Fehlerbehebung bei toten Boards, Flüssigkeitsschäden, USB-C Ladebuchsen oder extremer Überhitzung von CPU & GPU.'),
    points: [
      [msg('Logic-Board:'), msg('Kurzschlusssuche & Power-Rail Reparatur')],
      [msg('Wasserschaden:'), msg('Ultraschall-Reinigung & Entsalzung')],
      [msg('Wartung:'), msg('Lüfterreinigung, Thermal Grizzly / Flüssigmetall')],
      [msg('Buchsen:'), msg('USB-C Power Delivery Buchsen professionell gelötet')],
    ],
    tag: msg('Windows & macOS Profi'),
    Icon: Laptop,
    accent: 'teal',
  },
  {
    title: msg('Gaming-Konsolen & Controller'),
    text: msg('Fachgerechter Austausch ausgerissener Buchsen, Behebung von Abschaltungen durch Überhitzung und langlebige Controller-Upgrades.'),
    points: [
      ['PS5 / Xbox:', msg('Neuer OEM-HDMI-Port professionell eingelötet')],
      [msg('Überhitzungsschutz:'), msg('Erneuerung des Flüssigmetalls & Politur')],
      ['Hall-Effect Sticks:', msg('Magnet-Sensoren gegen Stick-Drift')],
      ['Nintendo Switch:', msg('USB-C Buchsen & M92T36 Power-IC Reparatur')],
    ],
    tag: msg('Beliebtes Upgrade'),
    Icon: Gamepad2,
    accent: 'orange',
  },
  {
    title: msg('Autoschlüssel & Funkschlüssel'),
    text: msg('Ein neuer Schlüssel im Autohaus kostet schnell 250 € bis 500 €. Wir setzen deine Originalplatine wieder vollständig instand.'),
    points: [
      ['', msg('Erneuerung gebrochener Mikrotaster & SMD-Schalter')],
      ['', msg('Austausch fest verlöteter Akkus (z. B. BMW-Schlüssel)')],
      ['', msg('Gehäusetausch & Reparatur gerissener Leiterbahnen')],
      ['', msg('Frequenz- und Transponderprüfung vor Ort (433 / 868 MHz)')],
    ],
    tag: msg('Spart bis zu 80%'),
    Icon: KeyRound,
    accent: 'teal',
  },
  {
    title: msg('Chip-Level Notfall-Datenrettung'),
    text: msg('Sicherung deiner Fotos, WhatsApp-Chats und Firmenunterlagen von scheinbar »toten« oder schwer beschädigten Geräten.'),
    points: [
      ['', msg('Smartphones & Laptops nach extremem Flüssigkeitsschaden')],
      ['', msg('Kurzschlussbeseitigung auf Hauptstromschienen (VDD_MAIN)')],
      ['', msg('Reparatur defekter Lade- & Power-ICs')],
      ['No Data – No Fee:', msg('Keine Kosten bei erfolgloser Rettung!')],
    ],
    tag: msg('100% Diskretion'),
    Icon: HardDrive,
    accent: 'orange',
  },
  {
    title: msg('Mikrolöten & Platinenservice'),
    text: msg('SMD-, QFN- und BGA-Arbeiten unter dem Mikroskop für Privatkunden sowie als verlässlicher Subunternehmer für Werkstätten.'),
    points: [
      ['', msg('Instandsetzung abgerissener Lötaugen & Pads (Jumper Wires)')],
      ['', msg('Kurzschlusssuche via Wärmebildkamera & Multimeter')],
      ['', msg('B2B-Partnerkonditionen für Reparaturwerkstätten')],
      ['', msg('Schnelle Durchlaufzeiten ohne lange Wartezeiten')],
    ],
    tag: msg('B2B Partner-Netz'),
    Icon: Microscope,
    accent: 'teal',
  },
  {
    title: msg('Smartphone & Tablet Service'),
    text: msg('Der bewährte Klassiker mit geprüften Qualitätsersatzteilen und 6 Monaten Garantie auf alle durchgeführten Arbeiten.'),
    points: [
      ['', msg('Display- & Akkutausch (Apple iPhone, Samsung, Pixel etc.)')],
      ['', msg('Ladebuchsen-, Lautsprecher- und Kameratausch')],
      ['', msg('Lade-IC Reparaturen bei iPad & iPhone (Tristar / Hydra)')],
      ['', msg('Geprüfte Erstausrüster- oder Original-Qualität')],
    ],
    tag: msg('Express nach Absprache'),
    Icon: Smartphone,
    accent: 'orange',
  },
];

const ACCENT_ICON = {
  teal: 'border-[#00F5D4]/30 bg-[#00F5D4]/10 text-[#00F5D4]',
  orange: 'border-[#FF8D4D]/30 bg-[#FF8D4D]/10 text-[#FF8D4D]',
};

export const ServiceMatrix: React.FC = () => {
  const { t } = useI18n();
  return (
    <section id="services" className="py-16 md:py-24 relative section-band">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          index="03"
          eyebrow={t('Leistungen')}
          title={t('Echtes Handwerk auf Platinenebene')}
          intro={t('Wo andere Werkstätten aufgeben und nur teure Neuteile verkaufen, reparieren wir direkt am Bauteil.')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map(({ title, text, points, tag, Icon, accent }) => (
            <div
              key={title}
              className="reveal bg-[#0B1315]/85 hover:bg-[#0F1A1C] border border-white/[0.08] hover:border-[#00F5D4]/40 rounded-2xl p-6 sm:p-7 transition-all duration-300 group hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <div
                className={`w-12 h-12 mb-5 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${ACCENT_ICON[accent]}`}
              >
                <Icon className="w-6 h-6" strokeWidth={1.6} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t(title)}</h3>
              <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">{t(text)}</p>
              <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
                {points.map(([strong, rest]) => (
                  <li key={rest} className="flex items-center gap-2 text-[#F3F7F7]">
                    <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                    <span>
                      {strong && <strong>{t(strong)} </strong>}
                      {t(rest)}
                    </span>
                  </li>
                ))}
              </ul>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
                {t(tag)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
