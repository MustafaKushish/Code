import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck,
  Check,
  ClipboardList,
  FileText,
  Globe,
  Languages,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Monitor,
  Package,
  Receipt,
  KeyRound,
  QrCode,
  Search,
  Send,
  Smartphone,
  Store,
} from 'lucide-react';
import { msg, useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SectionHeading } from './ui/SectionHeading';
import { whatsappLink } from '../utils/whatsapp';
import { HeroMockup, Marquee, trackSpotlight } from './DigitalShowcase';

// CODE Digital: Websites, Geschäftssysteme und IT-Betreuung für lokale Unternehmen.
// Eigene Unterseite unter /digital, damit die Reparatur-Startseite übersichtlich bleibt.

const OFFERS = [
  {
    icon: Globe,
    title: msg('Website'),
    text: msg('Moderne Website, die auf dem Handy perfekt aussieht, bei Google gefunden wird und Anfragen direkt zu dir bringt.'),
  },
  {
    icon: LayoutDashboard,
    title: msg('Geschäftssystem'),
    text: msg('Dein eigenes Programm für Aufträge, Kunden, Termine, Rechnungen und Lager. Läuft im Browser und als App auf Handy und Tablet.'),
  },
  {
    icon: Receipt,
    title: msg('Kassensystem'),
    text: msg('Kasse für Laden, Café oder Imbiss mit Bon, Tagesabschluss und Anbindung an eine zertifizierte TSE. Auf Tablet, PC oder Kassen-Hardware.'),
  },
  {
    icon: LifeBuoy,
    title: msg('IT-Betreuung'),
    text: msg('Hosting, Domain, E-Mail, Updates und Backups. Wenn etwas hängt, hast du einen festen Ansprechpartner vor Ort.'),
  },
  {
    icon: Monitor,
    title: msg('Hardware & Einrichtung'),
    text: msg('PCs, Laptops, Drucker, WLAN und Kassen-Hardware: Wir richten alles ein und reparieren es selbst, wenn es kaputtgeht.'),
  },
];

const MODULES = [
  { icon: CalendarCheck, label: msg('Online-Terminbuchung') },
  { icon: MessageSquare, label: msg('Anfragen per WhatsApp & Formular') },
  { icon: ClipboardList, label: msg('Auftrags- & Kundenverwaltung') },
  { icon: FileText, label: msg('Angebote & Rechnungen als PDF') },
  { icon: Package, label: msg('Lager & Bestellungen') },
  { icon: Receipt, label: msg('Kasse mit Bon & Tagesabschluss') },
  { icon: KeyRound, label: msg('Eigene Zugangsdaten & Rechte für Mitarbeiter') },
  { icon: QrCode, label: msg('Status-Abfrage für deine Kunden') },
  { icon: Languages, label: msg('Mehrsprachige Website') },
  { icon: Bot, label: msg('KI-Assistent im Chat') },
  { icon: BarChart3, label: msg('Umsatz & Auswertungen') },
  { icon: Smartphone, label: msg('Als App installierbar') },
  { icon: Search, label: msg('Google-Profil & lokale Suche') },
  { icon: Store, label: msg('Produkte, Speisekarte oder Preisliste') },
];

const REFERENCE_POINTS = [
  msg('Preisrechner, der Reparaturpreise sofort anzeigt'),
  msg('Auftragsstatus per Nummer oder QR-Code abfragen'),
  msg('Website auf Deutsch, Englisch, Türkisch und Arabisch'),
  msg('KI-Techniker, der Fehler beschreibt und Preise nennt'),
  msg('Internes Werkstatt-System: Aufträge, Termine, Lager, Rechnungen, Unterschrift, Auswertungen'),
];

const PACKAGES = [
  {
    name: 'Start',
    price: 490,
    tagline: msg('Professionell sichtbar werden'),
    features: [
      msg('Website mit bis zu 5 Seiten'),
      msg('Perfekt auf dem Handy'),
      msg('Kontakt per WhatsApp, Telefon & Formular'),
      msg('Google-Profil eingerichtet'),
      msg('Impressum- und Datenschutzseite eingebunden'),
    ],
  },
  {
    name: 'Business',
    price: 990,
    tagline: msg('Mehr Kunden, weniger Telefon'),
    highlight: true,
    features: [
      msg('Alles aus Start'),
      msg('Online-Terminbuchung'),
      msg('Website in mehreren Sprachen'),
      msg('Bewertungen & Referenzen'),
      msg('Optimiert für die Suche in deiner Stadt'),
    ],
  },
  {
    name: 'System',
    price: 2490,
    tagline: msg('Dein Geschäft digital steuern'),
    features: [
      msg('Alles aus Business'),
      msg('Eigenes Verwaltungssystem nach Maß'),
      msg('Aufträge, Kunden, Rechnungen & Lager'),
      msg('Eigene Zugangsdaten & Rechte für Mitarbeiter'),
      msg('Als App auf Handy & Tablet, mit Einweisung'),
    ],
  },
];

const EXTRAS = [
  { title: msg('Kassensystem'), text: msg('Einrichtung mit TSE, ohne Hardware'), price: 990, monthly: false },
  { title: msg('Betreuung'), text: msg('Hosting, Updates, Backups & kleine Änderungen'), price: 29, monthly: true },
];

const INDUSTRIES = [
  msg('Friseur & Kosmetik'),
  msg('Restaurant & Imbiss'),
  msg('Werkstatt & Handwerk'),
  msg('Einzelhandel'),
  msg('Praxis & Beratung'),
  msg('Vereine'),
];

const STEPS = [
  { title: msg('Erstgespräch'), text: msg('Kostenlos, bei dir im Laden oder bei uns. Wir hören zu, wie dein Alltag läuft.') },
  { title: msg('Konzept & Festpreis'), text: msg('Du bekommst einen klaren Plan und einen Festpreis, bevor wir anfangen.') },
  { title: msg('Bauen mit Vorschau'), text: msg('Du siehst den Fortschritt jederzeit über einen Vorschau-Link und sagst, was passt.') },
  { title: msg('Start & Betreuung'), text: msg('Wir stellen alles online, zeigen dir das System und bleiben danach ansprechbar.') },
];

const NEEDS = [msg('Website'), msg('Geschäftssystem'), msg('Kassensystem'), msg('IT-Betreuung'), msg('Hardware & Einrichtung')];

const formatEuro = (n: number) => `${n.toLocaleString('de-DE')} €`;

const DigitalHeader: React.FC = () => {
  const { t } = useI18n();
  return (
    <header className="site-header sticky z-40 mx-2 sm:mx-6 mb-4 sm:mb-6">
      <div className="max-w-7xl mx-auto backdrop-blur-xl border rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 bg-[#080E10]/80 border-[#00F5D4]/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <a href="/" className="flex items-center gap-2.5 shrink-0" title={t('Zur Werkstatt')}>
          <svg className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_0_12px_rgba(0,245,212,0.4)]" viewBox="0 0 500 500" aria-hidden="true">
            <rect width="500" height="500" rx="100" fill="#0C1517" stroke="#00F5D4" strokeWidth="12" />
            <rect x="100" y="100" width="300" height="300" rx="40" fill="#121F21" stroke="#D48842" strokeWidth="16" />
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
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-white">CODE</span>
            <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FF8D4D]/15 border border-[#FF8D4D]/40 text-[#FFB98A] font-bold">
              DIGITAL
            </span>
          </div>
        </a>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t('Zur Werkstatt')}</span>
          </a>
          <LanguageSwitcher />
          <a
            href="#anfrage"
            className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-xl text-sm font-semibold text-[#160B04] bg-gradient-to-b from-[#FFA060] to-[#D9783E] hover:brightness-110 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="max-[399px]:sr-only">{t('Anfragen')}</span>
          </a>
        </div>
      </div>
    </header>
  );
};

const InquiryForm: React.FC = () => {
  const { t } = useI18n();
  const [business, setBusiness] = useState('');
  const [industry, setIndustry] = useState('');
  const [needs, setNeeds] = useState<string[]>([msg('Website')]);
  const [note, setNote] = useState('');

  const toggle = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  // Die Nachricht bleibt deutsch, damit Mustafa jede Anfrage lesen kann
  const message = [
    'Hallo Mustafa, ich interessiere mich für CODE Digital.',
    business && `Geschäft: ${business}`,
    industry && `Branche: ${industry}`,
    needs.length > 0 && `Interesse: ${needs.join(', ')}`,
    note && `Nachricht: ${note}`,
  ]
    .filter(Boolean)
    .join('\n');

  const input =
    'w-full h-11 px-3.5 rounded-xl bg-[#060B0C] border border-white/10 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00F5D4]/60';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs text-[#94A9AA] mb-1.5">{t('Name deines Geschäfts')}</span>
          <input className={input} value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={t('z. B. Salon Aylin')} />
        </label>
        <label className="block">
          <span className="block text-xs text-[#94A9AA] mb-1.5">{t('Branche')}</span>
          <input className={input} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={t('z. B. Friseur')} />
        </label>
      </div>
      <fieldset>
        <legend className="block text-xs text-[#94A9AA] mb-2">{t('Was brauchst du?')}</legend>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => {
            const on = needs.includes(n);
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(n)}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm border transition-colors cursor-pointer ${
                  on ? 'bg-[#00F5D4]/15 border-[#00F5D4]/60 text-[#00F5D4]' : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:border-white/25'
                }`}
              >
                {on && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                {t(n)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block">
        <span className="block text-xs text-[#94A9AA] mb-1.5">{t('Was soll besser laufen? (optional)')}</span>
        <textarea
          className={`${input} h-28 py-3 resize-none`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('z. B. Termine kommen nur per Telefon, Rechnungen schreibe ich in Word …')}
        />
      </label>
      <button
        type="submit"
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 transition-all cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{t('Per WhatsApp anfragen')}</span>
      </button>
    </form>
  );
};

export const DigitalPage: React.FC = () => {
  const { t } = useI18n();

  useEffect(() => {
    const prev = document.title;
    document.title = t('CODE Digital – Websites & Systeme für Unternehmen in Neumarkt');
    return () => {
      document.title = prev;
    };
  }, [t]);

  return (
    <>
      <DigitalHeader />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="relative pt-6 pb-14 md:pt-14 md:pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="reveal max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#FFB98A] px-3 py-1.5 rounded-full border border-[#FF8D4D]/30 bg-[#FF8D4D]/10 mb-5">
                <Store className="w-4 h-4" />
                {t('Für Geschäfte in Neumarkt und Umgebung')}
              </div>
              <h1 className="text-shine text-[2.3rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-balance">
                {t('Website und System, die dein Geschäft zum Laufen bringen.')}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#94A9AA] leading-relaxed max-w-2xl">
                {t('Wir bauen nicht nur eine schöne Seite, sondern auch das Werkzeug dahinter: Termine, Aufträge, Kunden, Rechnungen und Lager in einem System, das zu deinem Laden passt.')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#anfrage"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#00F5D4] text-[#04110F] hover:bg-white shadow-[0_10px_40px_rgba(0,245,212,0.35)] hover:-translate-y-0.5 transition-all"
                >
                  <span>{t('Kostenloses Erstgespräch')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </a>
                <a
                  href="#pakete"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold text-white bg-white/5 border border-white/15 hover:border-[#00F5D4]/60 transition-colors"
                >
                  {t('Pakete ansehen')}
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-300">
                {[msg('Persönlich aus Neumarkt'), msg('Festpreis vor Projektstart'), msg('Betreuung nach dem Start')].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00F5D4]" strokeWidth={2.5} />
                    {t(p)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal">
              <HeroMockup />
            </div>
            </div>
          </div>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading index="01" eyebrow={t('Leistungen')} title={t('Alles aus einer Hand')} intro={t('Von der ersten Website bis zum kompletten System, und wenn ein Gerät kaputtgeht, reparieren wir es selbst.')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {OFFERS.map(({ icon: Icon, title, text }, i) => (
                <div
                  key={title}
                  onMouseMove={trackSpotlight}
                  className={`reveal spotlight glass rounded-3xl p-6 sm:p-7 transition-transform duration-300 hover:-translate-y-1 ${
                    i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
                  } ${i === 0 ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                >
                  <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00F5D4]/25 to-[#FF8D4D]/15 border border-white/10 text-[#00F5D4] mb-5">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2">{t(title)}</h3>
                  <p className="text-sm text-[#94A9AA] leading-relaxed">{t(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bausteine */}
        <section id="bausteine" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading index="02" eyebrow={t('Bausteine')} title={t('Du nimmst nur, was du brauchst')} intro={t('Jedes System wird aus diesen Bausteinen zusammengesetzt und an deine Abläufe angepasst.')} />
            <div className="reveal space-y-3">
              {[MODULES.slice(0, 7), MODULES.slice(7)].map((row, r) => (
                <Marquee
                  key={r}
                  reverse={r === 1}
                  items={row.map(({ icon: Icon, label }) => (
                    <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3.5 whitespace-nowrap">
                      <Icon className="w-5 h-5 text-[#FF8D4D] shrink-0" />
                      <span className="text-[15px] text-zinc-100">{t(label)}</span>
                    </div>
                  ))}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Referenz */}
        <section id="referenz" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="reveal relative overflow-hidden rounded-3xl border border-[#00F5D4]/25 bg-[#071113] p-7 sm:p-10 lg:p-12">
              <div aria-hidden="true" className="pcb-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)] rtl:[mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
              <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-2">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3">
                    <span className="text-[#FF8D4D] font-bold">03</span> <span className="text-[#00F5D4]">{t('Referenz')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 text-balance">
                    {t('Unser bestes Beispiel: CODE selbst.')}
                  </h2>
                  <p className="text-sm sm:text-base text-[#94A9AA] leading-relaxed mb-6">
                    {t('Die Werkstatt-Website und das System, mit dem wir jeden Tag arbeiten, haben wir selbst gebaut. Genau so etwas bauen wir auch für dein Geschäft.')}
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-[#00F5D4] border border-[#00F5D4]/35 bg-[#00F5D4]/10 hover:bg-[#00F5D4] hover:text-[#04110F] transition-all"
                  >
                    <span>{t('Werkstatt-Website ansehen')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </a>
                </div>
                <ul className="lg:col-span-3 space-y-3">
                  {REFERENCE_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm sm:text-[15px] text-zinc-200">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00F5D4]/15 text-[#00F5D4] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                      <span>{t(p)}</span>
                    </li>
                  ))}
                  <li className="text-xs text-[#5F7473] ps-8">{t('Das interne System zeigen wir dir gern live im Erstgespräch.')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pakete */}
        <section id="pakete" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading index="04" eyebrow={t('Pakete')} title={t('Drei Wege zum Start')} intro={t('Klare Einstiegspreise. Nach dem Erstgespräch bekommst du einen Festpreis für genau dein Projekt.')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKAGES.map((p) => (
                <div
                  key={p.name}
                  className={`reveal relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                    p.highlight ? 'gradient-border md:-translate-y-3 shadow-[0_30px_80px_rgba(255,141,77,0.18)]' : 'glass'
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 start-6 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF8D4D] text-[#160B04]">
                      {t('Beliebt')}
                    </span>
                  )}
                  <h3 className="font-mono text-xl font-bold text-white tracking-wide">{p.name}</h3>
                  <p className="text-sm text-[#94A9AA] mt-1 mb-5">{t(p.tagline)}</p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200">
                        <Check className="w-4 h-4 mt-0.5 text-[#00F5D4] shrink-0" strokeWidth={2.5} />
                        <span>{t(f)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mb-4">
                    <span className="text-sm text-[#94A9AA]">{t('ab')} </span>
                    <span className="text-2xl font-bold text-white">{formatEuro(p.price)}</span>
                    <span className="block text-xs text-[#5F7473] mt-1">{t('einmalig, Festpreis nach Erstgespräch')}</span>
                  </p>
                  <a
                    href={whatsappLink(`Hallo Mustafa, ich interessiere mich für das Paket „${p.name}“ von CODE Digital.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all ${
                      p.highlight ? 'bg-[#FF8D4D] text-[#160B04] hover:brightness-110' : 'bg-white/5 border border-white/15 text-white hover:border-[#00F5D4]/60'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t('Paket anfragen')}</span>
                  </a>
                </div>
              ))}
            </div>
            <div className="reveal mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXTRAS.map((x) => (
                <div key={x.title} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
                  <div>
                    <p className="text-[15px] font-semibold text-white">{t(x.title)}</p>
                    <p className="text-xs text-[#94A9AA] mt-0.5">{t(x.text)}</p>
                  </div>
                  <p className="text-end shrink-0">
                    <span className="text-xs text-[#94A9AA]">{t('ab')} </span>
                    <span className="text-lg font-bold text-white">{formatEuro(x.price)}</span>
                    {x.monthly && <span className="block text-xs text-[#94A9AA]">{t('pro Monat')}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Branchen + Ablauf */}
        <section id="ablauf" className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeading index="05" eyebrow={t('Ablauf')} title={t('In vier Schritten online')} />
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {STEPS.map((s, i) => (
                <li key={s.title} className="reveal rounded-2xl border border-white/10 bg-[#0B1315]/80 p-6">
                  <span className="font-mono text-sm font-bold text-[#FF8D4D]">0{i + 1}</span>
                  <h3 className="text-lg font-semibold text-white mt-2 mb-2">{t(s.title)}</h3>
                  <p className="text-sm text-[#94A9AA] leading-relaxed">{t(s.text)}</p>
                </li>
              ))}
            </ol>
            <div className="reveal text-center">
              <p className="text-sm text-[#94A9AA] mb-4">{t('Passt für viele Branchen, zum Beispiel:')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {INDUSTRIES.map((b) => (
                  <span key={b} className="px-3.5 py-1.5 rounded-full text-sm bg-white/[0.04] border border-white/10 text-zinc-200">
                    {t(b)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Anfrage */}
        <section id="anfrage" className="py-12 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeading index="06" eyebrow={t('Anfrage')} title={t('Erzähl uns von deinem Geschäft')} intro={t('Ein paar Angaben reichen. Wir melden uns per WhatsApp und machen einen Termin für das kostenlose Erstgespräch aus.')} />
            <div className="reveal rounded-3xl border border-white/10 bg-[#0B1315]/90 p-6 sm:p-8">
              <InquiryForm />
            </div>
            <p className="mt-6 text-center text-sm text-[#94A9AA]">
              {t('Lieber anrufen?')}{' '}
              <a href="tel:+4917641744443" dir="ltr" className="text-white hover:text-[#00F5D4] transition-colors">
                0176 4174 4443
              </a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};
