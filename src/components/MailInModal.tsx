import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Send, Printer, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { msg, useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';

interface MailInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM = { name: '', phone: '', device: '', fault: '', returnAddress: '', privacyAccepted: false };

const NEXT_STEPS = [
  msg('WhatsApp-Nachricht abschicken. Mustafa bestätigt und schickt dir die Versandadresse.'),
  msg('Begleitschein ausdrucken und mit ins Paket legen (oder die Nummer gut lesbar auf einen Zettel schreiben).'),
  msg('Gerät gut gepolstert und versichert verschicken. Die Sendungsnummer kurz per WhatsApp schicken.'),
  msg('Innerhalb von 24 Stunden nach Eingang bekommst du Diagnose und Festpreis. Repariert wird erst nach deiner Freigabe.'),
];

/** Einsende-Nummer wie EIN-261011-K7QX: Datum + 4 Zeichen, damit Paket und WhatsApp zusammenpassen */
function newReference(): string {
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => chars[b % chars.length]).join('');
  return `EIN-${date}-${rand}`;
}

/** Gerät per Post einsenden: Formular → vorbereitete WhatsApp-Nachricht → Begleitschein zum Ausdrucken */
export const MailInModal: React.FC<MailInModalProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);
  const [reference, setReference] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Nach dem Schließen wieder mit einem leeren Formular beginnen
  useEffect(() => {
    if (!isOpen) {
      setReference(null);
      setQrDataUrl(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!reference) return;
    let alive = true;
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(reference, { margin: 1, width: 240 }))
      .then((url) => alive && setQrDataUrl(url))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [reference]);

  if (!isOpen) return null;

  // Feldnamen bleiben deutsch, damit die Werkstatt jede Einsendung gleich lesen kann
  const buildMessage = (ref: string) =>
    [
      t('Hallo Mustafa, ich möchte ein Gerät per Post zur Reparatur einsenden.'),
      '',
      `Einsende-Nr.: ${ref}`,
      `Name: ${form.name.trim()}`,
      `Telefon/WhatsApp: ${form.phone.trim()}`,
      `Gerät: ${form.device.trim()}`,
      `Fehler: ${form.fault.trim()}`,
      `Rücksendeadresse: ${form.returnAddress.trim().replace(/\s*\n\s*/g, ', ')}`,
      ...(lang !== 'de' ? [`Sprache: ${lang.toUpperCase()}`] : []),
      '',
      t('Bitte schick mir die Versandadresse. Danke!'),
    ].join('\n');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.device.trim() || !form.fault.trim() || !form.returnAddress.trim()) {
      setErrorMsg(t('Bitte fülle alle markierten Pflichtfelder aus.'));
      return;
    }
    if (!form.privacyAccepted) {
      setErrorMsg(t('Bitte bestätige die Datenschutzhinweise.'));
      return;
    }
    setErrorMsg(null);
    const ref = reference || newReference();
    setReference(ref);
    window.open(whatsappLink(buildMessage(ref)), '_blank', 'noopener');
  };

  const handlePrint = () => {
    document.body.classList.add('print-mode-slip');
    const cleanup = () => {
      document.body.classList.remove('print-mode-slip');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Manche Browser feuern afterprint nicht zuverlässig
    setTimeout(cleanup, 1500);
  };

  const field =
    'w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono';
  const label = 'block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Gerät einsenden')}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-[#0B1315] border border-[#00F5D4]/35 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('Schließen')}
          className="absolute top-5 end-5 text-[#839897] hover:text-[#00F5D4] transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!reference ? (
          <>
            <div className="mb-6 pe-8">
              <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Package className="w-4 h-4" />
                {t('Versand aus ganz Deutschland')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{t('Gerät einsenden')}</h3>
              <p className="text-xs sm:text-sm text-[#839897] mt-1 leading-relaxed">
                {t('Kurz ausfüllen, per WhatsApp abschicken, Begleitschein ausdrucken. Du bekommst eine Einsende-Nummer, damit dein Paket sofort zugeordnet wird.')}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mailin-name" className={label}>
                    {t('Vor- & Nachname')} *
                  </label>
                  <input
                    id="mailin-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="mailin-phone" className={label}>
                    {t('Telefon / WhatsApp')} *
                  </label>
                  <input
                    id="mailin-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={field}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mailin-device" className={label}>
                  {t('Gerätemodell')} *
                </label>
                <input
                  id="mailin-device"
                  type="text"
                  required
                  value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                  placeholder={t('z. B. PS5 Disc Edition, MacBook Pro A2141, BMW F30 Funkschlüssel')}
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="mailin-fault" className={label}>
                  {t('Fehlerbeschreibung')} *
                </label>
                <textarea
                  id="mailin-fault"
                  required
                  rows={3}
                  value={form.fault}
                  onChange={(e) => setForm({ ...form, fault: e.target.value })}
                  placeholder={t('Was genau passiert? Geht das Gerät aus, wackelt der Anschluss, gibt es Bildfehler?')}
                  className={`${field} resize-none`}
                />
              </div>

              <div>
                <label htmlFor="mailin-address" className={label}>
                  {t('Rücksendeadresse')} *
                </label>
                <textarea
                  id="mailin-address"
                  required
                  rows={2}
                  autoComplete="street-address"
                  value={form.returnAddress}
                  onChange={(e) => setForm({ ...form, returnAddress: e.target.value })}
                  placeholder={t('Straße und Hausnummer, PLZ und Ort')}
                  className={`${field} resize-none`}
                />
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.privacyAccepted}
                  onChange={(e) => setForm({ ...form, privacyAccepted: e.target.checked })}
                  className="w-4 h-4 accent-[#FF8D4D] rounded mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-[#F3F7F7]">
                  {t('Ich bestätige die Richtigkeit der Angaben und habe die Datenschutzhinweise gelesen. Der Reparaturauftrag kommt erst nach Prüfung und Kostenfreigabe zustande.')} *
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('Per WhatsApp anmelden')}</span>
              </button>
              <p className="text-[11px] text-[#6F8584] text-center">
                {t('Deine Angaben werden nicht auf dieser Website gespeichert, sondern nur als WhatsApp-Nachricht vorbereitet.')}
              </p>
            </form>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#25D366]/15 border border-[#25D366] text-[#25D366] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{t('Fast geschafft!')}</h3>
              <p className="text-sm text-[#A3B5B6]">{t('Deine Einsende-Nummer:')}</p>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#00F5D4] tracking-wider mt-1" dir="ltr">
                {reference}
              </div>
            </div>

            <ol className="space-y-3">
              {NEXT_STEPS.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm text-zinc-200">
                  <span className="w-6 h-6 rounded-full bg-[#D9783E] text-[#160B04] text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{t(step)}</span>
                </li>
              ))}
            </ol>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={whatsappLink(buildMessage(reference))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                {t('WhatsApp erneut öffnen')}
              </a>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold border border-[#00F5D4]/50 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#04110F] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {t('Begleitschein drucken')}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="block mx-auto text-xs text-[#839897] hover:text-white underline underline-offset-4 cursor-pointer"
            >
              {t('Fenster schließen')}
            </button>
          </div>
        )}
      </div>

      {/* Begleitschein: nur beim Drucken sichtbar, bewusst auf Deutsch für die Werkstatt */}
      {reference &&
        createPortal(
          <div id="printMailInSlip" lang="de" dir="ltr">
            <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', maxWidth: 640 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>CODE IT-Werkstatt</div>
                  <div style={{ fontSize: 12 }}>92318 Neumarkt i.d.OPf. · 0176 4174 4443 · www.code-ger.de</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 16 }}>Begleitschein Einsendung</div>
                  <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'monospace', marginTop: 4 }}>{reference}</div>
                </div>
                {qrDataUrl && <img src={qrDataUrl} alt="" style={{ width: 120, height: 120 }} />}
              </div>
              <table style={{ width: '100%', fontSize: 14, marginTop: 16, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Name', form.name],
                    ['Telefon / WhatsApp', form.phone],
                    ['Gerät', form.device],
                    ['Fehler', form.fault],
                    ['Rücksendeadresse', form.returnAddress],
                    ['Datum', new Date().toLocaleDateString('de-DE')],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '8px 12px 8px 0', fontWeight: 700, width: 170, verticalAlign: 'top' }}>{k}</td>
                      <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 12, marginTop: 20 }}>
                Bitte diesen Schein ins Paket legen. Diagnose und Festpreis innerhalb von 24 Stunden nach Eingang. Repariert
                wird erst nach Freigabe durch den Kunden.
              </p>
              {lang !== 'de' && <p style={{ fontSize: 12, marginTop: 8 }}>Sprache des Kunden: {lang.toUpperCase()}</p>}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
