import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Search,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Camera,
  ClipboardCheck,
  Stethoscope,
  Wrench,
  CheckCircle2,
  PackageCheck,
  MapPin,
  Clock,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';
import { lazyNamed } from './ui/lazy';

const QrScannerModal = lazyNamed(() => import('./QrScannerModal'), 'QrScannerModal');
import { Order } from '../manager/types';
import { UNIFIED_STEPS, getStepNumber, getStepLabel, UnifiedStep } from '../utils/orderStatus';
import { fetchPublicOrderStatus } from '../services/cloudflareSync';
import { msg, useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';

interface DisplayTicket {
  ticketId: string;
  customerName: string;
  phone: string;
  device: string;
  fault: string;
  preDamages?: string;
  status: string;
  currentStep: number;
  statusDetails: string;
  createdAt: string;
  estimatedCompletion: string;
  testedPassed: boolean;
}

export const StatusTracker: React.FC = () => {
  const { t } = useI18n();
  const [ticketInput, setTicketInput] = useState('');
  const [ticketData, setTicketData] = useState<DisplayTicket | null>({
    ticketId: 'CODE-9231',
    customerName: 'Max M.',
    phone: '0176 **** 443',
    device: 'PlayStation 5 (Disc Edition)',
    fault: msg('HDMI-Buchse herausgebrochen, Leiterbahnen beschädigt'),
    preDamages: msg('Leichte Kratzer an der Faceplate'),
    status: msg('5. Fertig & Abholbereit'),
    currentStep: 5,
    statusDetails:
      msg('OEM-HDMI-Port erfolgreich eingelötet (Silberlot). 4K/120Hz Signal stabil. 30-Minuten Lasttest bestanden. Gerät gereinigt und abholbereit versiegelt.'),
    createdAt: msg('Heute, 10:15 Uhr'),
    estimatedCompletion: msg('Jetzt abholbereit an der Werkbank'),
    testedPassed: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [phone4Input, setPhone4Input] = useState('');
  const phone4Ref = useRef<HTMLInputElement>(null);

  // Auto-detect ?order=CODE-XXXX from URL parameters on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderParam = params.get('order') || params.get('ticket');
      if (orderParam) {
        const clean = orderParam.trim().toUpperCase();
        const phoneParam = (params.get('k') || '').replace(/\D/g, '').slice(-4);
        setTicketInput(clean);
        setPhone4Input(phoneParam);
        lookupOrder(clean, phoneParam);
        // Scroll to tracker view smoothly
        setTimeout(() => {
          const el = document.getElementById('status');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  const lookupOrder = async (queryText: string, phoneText: string = phone4Input) => {
    const cleanQuery = queryText.trim().toUpperCase();
    if (!cleanQuery) return;

    setIsLoading(true);
    setSearchError(null);

    // 1. Check in embedded manager orders (localStorage 'code_orders_v2')
    try {
      const storedOrdersRaw = localStorage.getItem('code_orders_v2');
      if (storedOrdersRaw) {
        const storedOrders: Order[] = JSON.parse(storedOrdersRaw);
        const matched = storedOrders.find(
          (o) =>
            o.id.toUpperCase() === cleanQuery ||
            o.id.toUpperCase().replace(/^KVA-/, 'RE-') === cleanQuery.replace(/^KVA-/, 'RE-')
        );

        if (matched) {
          const step = getStepNumber(matched.status);
          const customerMasked =
            matched.cust.length > 3
              ? matched.cust.slice(0, 3) + '***'
              : matched.cust;

          const defaultDesc = UNIFIED_STEPS.find((s) => s.step === step)?.defaultStatusText || '';

          setTicketData({
            ticketId: matched.id,
            customerName: customerMasked,
            phone: matched.phone ? matched.phone.slice(0, 4) + ' ****' : '–',
            device: matched.device,
            fault: matched.faultDescription || matched.device,
            preDamages: matched.accessories ? t('Zubehör: {items}', { items: matched.accessories }) : '–',
            status: matched.status || getStepLabel(step),
            currentStep: step,
            statusDetails:
              step === 5
                ? t('Reparatur erfolgreich abgeschlossen ({payment}). Gerät liegt an der Werkbank in Neumarkt bereit!', {
                    payment: matched.paid === 'Bezahlt' ? t('bereits bezahlt') : t('Zahlung bei Abholung'),
                  })
                : defaultDesc,
            createdAt: matched.date || msg('Aktueller Auftrag'),
            estimatedCompletion: completionText(step),
            testedPassed: step >= 4,
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('LocalStorage order lookup error:', e);
    }

    // 2. Demo-Aufträge zum Ausprobieren
    if (cleanQuery === 'CODE-9231') {
      setTicketData({
        ticketId: 'CODE-9231',
        customerName: 'Max M.',
        phone: '0176 **** 443',
        device: 'PlayStation 5 (Disc Edition)',
        fault: msg('HDMI-Buchse herausgebrochen, Leiterbahnen beschädigt'),
        status: msg('5. Fertig & Abholbereit'),
        currentStep: 5,
        statusDetails: msg('OEM-HDMI-Port erfolgreich eingelötet (Silberlot). 4K/120Hz Signal stabil. 30-Minuten Lasttest bestanden. Gerät liegt abholbereit vor Ort.'),
        createdAt: msg('Heute, 10:15 Uhr'),
        estimatedCompletion: msg('Jetzt abholbereit an der Werkbank'),
        testedPassed: true,
      });
    } else if (cleanQuery === 'CODE-4412') {
      setTicketData({
        ticketId: 'CODE-4412',
        customerName: 'Laura B.',
        phone: '0151 **** 891',
        device: 'Lenovo ThinkPad T14 Gen 2',
        fault: msg('Flüssigkeitsschaden Kaffee, startet nicht mehr'),
        status: msg('3. Reparatur & Bearbeitung'),
        currentStep: 3,
        statusDetails: msg('Kurzschluss auf 19V VDD_MAIN durch defekten SMD-Kondensator behoben. Leiterbahnrekonstruktion läuft.'),
        createdAt: msg('Gestern, 14:30 Uhr'),
        estimatedCompletion: msg('Morgen Vormittag'),
        testedPassed: false,
      });
    } else if (cleanQuery === 'CODE-7708') {
      setTicketData({
        ticketId: 'CODE-7708',
        customerName: 'Thomas K.',
        phone: '0170 **** 881',
        device: 'DualSense PS5 Controller',
        fault: msg('Massiver Stick-Drift auf linker Achse (Hall-Effect Umbau)'),
        status: msg('4. Qualitätsprüfung & Test'),
        currentStep: 4,
        statusDetails: msg('Hall-Effect Magnet-Stick eingelötet. Zirkularitäts-Prüfung und Deadzone-Kalibrierung im Gange.'),
        createdAt: msg('Vorgestern'),
        estimatedCompletion: msg('Heute Nachmittag'),
        testedPassed: true,
      });
    } else if (cleanQuery === 'CODE-1085') {
      setTicketData({
        ticketId: 'CODE-1085',
        customerName: 'Michael W.',
        phone: '0160 **** 219',
        device: msg('BMW Funkschlüssel (Rautenform)'),
        fault: msg('Akku leer (VL2020), ZV-Taster ohne Funktion'),
        status: msg('1. Eingang & Registrierung'),
        currentStep: 1,
        statusDetails: msg('Gerät digital erfasst, Sicherheits-Etikett mit QR-Code gedruckt und der Werkbank zugewiesen.'),
        createdAt: msg('Heute, 11:00 Uhr'),
        estimatedCompletion: msg('Heute, 16:30 Uhr'),
        testedPassed: false,
      });
    } else if (cleanQuery === 'CODE-3042') {
      setTicketData({
        ticketId: 'CODE-3042',
        customerName: 'Sarah L.',
        phone: '0172 **** 441',
        device: 'Apple iPhone 14 Pro Max',
        fault: msg('Bootloop nach Speicherüberlauf (Fehler 14)'),
        status: msg('2. Labor-Diagnose'),
        currentStep: 2,
        statusDetails: msg('Mikroskopische 40x Sichtprüfung und DFU-Recovery Analyse zur Sicherung der Benutzerdaten aktiv.'),
        createdAt: msg('Heute, 09:30 Uhr'),
        estimatedCompletion: msg('Morgen Vormittag'),
        testedPassed: false,
      });
    } else {
      // 3. Echte Aufträge: nur mit Auftragsnummer + letzten 4 Ziffern der Telefonnummer
      const phone4 = phoneText.replace(/\D/g, '');
      if (phone4.length !== 4) {
        setSearchError(t('Bitte zusätzlich die letzten 4 Ziffern deiner Telefonnummer eingeben (Schutz deiner Daten).'));
        setTicketData(null);
        setIsLoading(false);
        return;
      }

      const { order, error } = await fetchPublicOrderStatus(cleanQuery, phone4);
      if (order) {
        const step = getStepNumber(order.status);
        const defaultDesc = UNIFIED_STEPS.find((s) => s.step === step)?.defaultStatusText || '';
        setTicketData({
          ticketId: order.id,
          customerName: order.customer || t('Kunde'),
          phone: `**** ${phone4}`,
          device: order.device || msg('Werkstatt-Gerät'),
          fault: msg('Diagnose & Reparatur'),
          status: order.status || getStepLabel(step),
          currentStep: step,
          statusDetails:
            step === 5
              ? t('Reparatur erfolgreich abgeschlossen ({payment}). Gerät liegt zur Abholung bereit!', {
                  payment: order.paid === 'Bezahlt' ? t('bereits bezahlt') : t('Zahlung bei Abholung'),
                })
              : defaultDesc,
          createdAt: order.date || msg('Aktueller Auftrag'),
          estimatedCompletion: completionText(step),
          testedPassed: step >= 4,
        });
      } else {
        // Meldungen des Servers sind deutsch und werden übersetzt, wenn eine Übersetzung existiert
        setSearchError(
          error
            ? t(error)
            : t('Auftrag "{id}" konnte nicht gefunden werden. Bitte prüfe Auftragsnummer und Telefonziffern oder scanne den QR-Code auf deinem Beleg.', {
                id: queryText,
              })
        );
        setTicketData(null);
      }
    }

    setIsLoading(false);
  };

  function completionText(step: number) {
    return step === 5 ? msg('Jetzt abholbereit') : step === 4 ? msg('Heute noch') : msg('1–2 Werktage');
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    lookupOrder(ticketInput);
  };

  const handleQrScanSuccess = (scannedId: string) => {
    setTicketInput(scannedId);
    if (phone4Input.replace(/\D/g, '').length === 4 || /^CODE-\d{4}$/.test(scannedId)) {
      lookupOrder(scannedId);
    } else {
      setSearchError(null);
      phone4Ref.current?.focus();
    }
  };

  const getStepIcon = (step: number, isActive: boolean) => {
    const className = `w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`;
    switch (step) {
      case 1:
        return <ClipboardCheck className={className} />;
      case 2:
        return <Stethoscope className={className} />;
      case 3:
        return <Wrench className={className} />;
      case 4:
        return <CheckCircle2 className={className} />;
      case 5:
      default:
        return <PackageCheck className={className} />;
    }
  };

  return (
    <section id="status" className="py-16 md:py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0A1214]/95 border border-[#00F5D4]/25 rounded-3xl px-4 py-7 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <SectionHeading
            index="02"
            eyebrow={t('Auftragsstatus')}
            title={t('Wo ist mein Gerät gerade?')}
            intro={t('Auftragsnummer (oder QR-Code vom Abholschein) und die letzten 4 Ziffern deiner Telefonnummer eingeben – fertig.')}
          />

          {/* Search Form with QR Code Scanner */}
          <div className="max-w-xl mx-auto mb-8 space-y-3">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder={t('Auftrags-Nr.')}
                  aria-label={t('Auftragsnummer')}
                  className="w-full bg-[#060D0E] border border-[#C9743F]/30 focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4] rounded-xl px-4 py-3 text-sm text-white placeholder-[#839897] outline-none font-mono uppercase"
                />
              </div>

              <input
                ref={phone4Ref}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={phone4Input}
                onChange={(e) => setPhone4Input(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={t('Tel. (4 Ziff.)')}
                aria-label={t('Letzte 4 Ziffern deiner Telefonnummer')}
                title={t('Die letzten 4 Ziffern der Telefonnummer, die du bei der Abgabe angegeben hast')}
                className="sm:w-36 bg-[#060D0E] border border-[#C9743F]/30 focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4] rounded-xl px-4 py-3 text-sm text-white placeholder-[#839897] outline-none font-mono tracking-widest"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-3 rounded-xl bg-[#122225] border border-[#00F5D4]/60 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  title={t('QR-Code mit Kamera scannen')}
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('QR Scannen')}</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-3 rounded-xl bg-[#00F5D4] text-[#060B0C] font-mono font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,245,212,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{t('Prüfen')}</span>
                </button>
              </div>
            </form>

            {/* Quick Demo Links */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs font-mono">
              <span className="text-[#839897]">{t('Schnell-Test:')}</span>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('CODE-9231');
                  lookupOrder('CODE-9231');
                }}
                className="text-[#00E676] hover:underline font-bold cursor-pointer"
              >
                CODE-9231 ({t('5. Abholbereit')})
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('CODE-4412');
                  lookupOrder('CODE-4412');
                }}
                className="text-[#FF8D4D] hover:underline cursor-pointer"
              >
                CODE-4412 ({t('3. Reparatur')})
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('CODE-7708');
                  lookupOrder('CODE-7708');
                }}
                className="text-[#00F5D4] hover:underline cursor-pointer"
              >
                CODE-7708 ({t('4. Test')})
              </button>
            </div>
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{searchError}</span>
              </div>
            </div>
          )}

          {/* Ticket Live Data View */}
          {ticketData && (
            <div className="bg-[#050A0B] border border-white/10 rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 animate-fade-in">
              {/* Ticket Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="font-mono text-xs text-[#839897] uppercase">{t('Auftrags-Nr.')}</span>
                  <div className="font-mono text-xl sm:text-2xl font-extrabold text-[#00F5D4]">
                    {ticketData.ticketId}
                  </div>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#839897] uppercase">{t('Kunde / Besitzer')}</span>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {ticketData.customerName}
                  </div>
                </div>
                <div>
                  <span className="font-mono text-xs text-[#839897] uppercase">{t('Gerät')}</span>
                  <div className="text-sm sm:text-base font-bold text-white">
                    {t(ticketData.device)}
                  </div>
                </div>
                <div className="text-start sm:text-end">
                  <span className="font-mono text-xs text-[#839897] uppercase">{t('Fertigstellung')}</span>
                  <div className="font-mono text-sm sm:text-base font-bold text-[#FF8D4D]">
                    {t(ticketData.estimatedCompletion)}
                  </div>
                </div>
              </div>

              {/* UNIFIED 5-STEP VISUAL PROGRESS BAR */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-mono text-[#00F5D4] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t('Werkstatt-Fortschritt:')}</span>
                    <span className="text-white">
                      {t('Schritt {n} von 5', { n: ticketData.currentStep })}
                    </span>
                  </span>
                  <span className="text-xs font-mono text-[#839897]">
                    {t('{percent} % abgeschlossen', { percent: Math.round((ticketData.currentStep / 5) * 100) })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 sm:gap-2 relative">
                  {UNIFIED_STEPS.map((st) => {
                    const isPassed = st.step <= ticketData.currentStep;
                    const isCurrent = st.step === ticketData.currentStep;
                    return (
                      <div
                        key={st.step}
                        className={`px-3 py-2 sm:p-3.5 rounded-xl border text-start sm:text-center transition-all flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-2 ${
                          isCurrent
                            ? 'bg-[#00F5D4]/15 border-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.35)] scale-[1.02]'
                            : isPassed
                            ? 'bg-[#00E676]/10 border-[#00E676]/50 text-white'
                            : 'bg-black/40 border-white/5 text-[#839897] opacity-60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[#00F5D4] text-[#060B0C] shadow-[0_0_12px_rgba(0,245,212,0.5)] font-bold'
                              : isPassed
                              ? 'bg-[#00E676] text-[#060B0C] font-bold'
                              : 'bg-white/5 text-zinc-500'
                          }`}
                        >
                          {isPassed ? (
                            st.step === ticketData.currentStep ? (
                              getStepIcon(st.step, true)
                            ) : (
                              <span className="font-bold text-sm">✓</span>
                            )
                          ) : (
                            getStepIcon(st.step, false)
                          )}
                        </div>

                        <div className="leading-tight">
                          <span
                            className={`text-[11px] font-mono block font-bold ${
                              isCurrent
                                ? 'text-[#00F5D4]'
                                : isPassed
                                ? 'text-[#00E676]'
                                : 'text-[#839897]'
                            }`}
                          >
                            {t(st.label)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMISCHES STATUS-TERMINAL */}
              <div className="bg-[#0C1719] border border-[#00F5D4]/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#00F5D4] font-bold uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-ping" />
                    <span>&gt; {t('DYNAMISCHES STATUS-TERMINAL')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span>{t('Gerätetyp:')}</span>
                    <strong className="text-white">{t(ticketData.device)}</strong>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[11px] text-[#839897] uppercase block mb-1">
                    {t('Letzte Labor-Meldung:')}
                  </span>
                  <p className="text-xs sm:text-sm text-white font-mono leading-relaxed bg-[#060C0E] border border-white/5 rounded-xl p-3.5">
                    {t(ticketData.statusDetails)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#FF8D4D]" />
                    <span>
                      {t('Voraussichtliche Fertigstellung:')}{' '}
                      <strong className="text-[#FF8D4D]">{t(ticketData.estimatedCompletion)}</strong>
                    </span>
                  </div>
                  {ticketData.testedPassed && (
                    <div className="flex items-center gap-1.5 text-[#00E676] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('Qualitätstest: Bestanden')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GROSSER HINWEIS FALLS STATUS = 5 (ABHOLBEREIT) */}
              {ticketData.currentStep === 5 && (
                <div className="bg-gradient-to-r from-[#00E676]/25 via-[#00F5D4]/15 to-[#00E676]/15 border-2 border-[#00E676] rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(0,230,118,0.25)] flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#00E676] text-[#060B0C] flex items-center justify-center shrink-0 shadow-lg shadow-[#00E676]/30">
                      <PackageCheck className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00E676]/30 border border-[#00E676] text-[#00E676] text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                        ✓ {t('REPARATUR ERFOLGREICH BEENDET')}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        {t('Gerät liegt zur Abholung bereit!')}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-200 mt-1 max-w-lg">
                        {t('Alle Arbeiten und 4K-Dauertests wurden erfolgreich abgeschlossen. Du kannst dein Gerät während der Öffnungszeiten direkt an der Werkbank abholen.')}
                      </p>
                    </div>
                  </div>

                  {/* Werkstatt-Adresse & Öffnungszeiten Box */}
                  <div className="bg-[#050C0E]/90 border border-white/15 rounded-xl p-4 text-xs font-mono shrink-0 space-y-2 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 text-[#00F5D4] font-bold">
                      <MapPin className="w-4 h-4 text-[#00F5D4] shrink-0" />
                      <span>{t('Werkstatt-Standort:')}</span>
                    </div>
                    <div className="text-white ps-5 font-semibold">
                      {t('92318 Neumarkt in der Oberpfalz')}
                      <span className="block text-[11px] text-zinc-400 font-normal mt-0.5">
                        {t('(Persönliche Abholung nach kurzer Terminabsprache)')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF8D4D] shrink-0" />
                      <span>{t('Mo–Fr 10:00–18:00 Uhr | Sa 10:00–14:00 Uhr')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                      <span dir="ltr">0176 4174 4443</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct WhatsApp Contact Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-mono text-[#839897]">
                  {t('Fragen zum Ablauf oder Abholtermin?')}
                </span>
                <a
                  href={whatsappLink(
                    t('Hallo Mustafa, ich frage zum Auftrag {id} ({device}, aktueller Status: {status}).', {
                      id: ticketData.ticketId,
                      device: t(ticketData.device),
                      status: t(ticketData.status),
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-[#040809] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('Mustafa per WhatsApp kontaktieren')}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live QR Camera Scanner Modal */}
      {isScannerOpen && (
        <Suspense fallback={null}>
          <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleQrScanSuccess} />
        </Suspense>
      )}
    </section>
  );
};
