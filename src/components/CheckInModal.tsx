import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetData?: { device?: string; fault?: string };
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, presetData }) => {
  const { t, lang } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    device: '',
    fault: '',
    preDamages: '',
    loanerWanted: false,
    privacyAccepted: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (presetData) {
      setFormData((prev) => ({
        ...prev,
        device: presetData.device || prev.device,
        fault: presetData.fault || prev.fault,
      }));
    }
  }, [presetData]);

  // Beim erneuten Öffnen wieder mit dem Formular beginnen
  useEffect(() => {
    if (!isOpen) setSubmitted(false);
  }, [isOpen]);

  if (!isOpen) return null;

  // Die Angaben gehen als vorbereitete Nachricht direkt an die Werkstatt (WhatsApp oder E-Mail).
  // So landet jeder Check-in garantiert bei Mustafa – es wird nichts auf einem Server gespeichert.
  // Die Feldnamen bleiben deutsch, damit die Werkstatt jede Nachricht gleich lesen kann
  const buildMessage = () =>
    [
      t('Hallo Mustafa, hier mein digitaler Geräte-Check-in:'),
      '',
      `Name: ${formData.name.trim()}`,
      `Telefon/WhatsApp: ${formData.phone.trim()}`,
      `Gerät: ${formData.device.trim()}`,
      `Fehler: ${formData.fault.trim()}`,
      `Vorschäden: ${formData.preDamages.trim() || 'keine angegeben'}`,
      ...(formData.loanerWanted ? ['Leihgerät: gewünscht'] : []),
      ...(lang !== 'de' ? [`Sprache: ${lang.toUpperCase()}`] : []),
      '',
      t('Angaben bestätigt, Datenschutzhinweise gelesen.'),
      t('Wann kann ich das Gerät in Neumarkt abgeben?'),
    ].join('\n');

  const whatsappUrl = () => whatsappLink(buildMessage());
  const mailUrl = () =>
    `mailto:mustafa.alzurgany@gmail.com?subject=${encodeURIComponent(
      `Check-in: ${formData.device.trim()}`
    )}&body=${encodeURIComponent(buildMessage())}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.device || !formData.fault) {
      setErrorMsg(t('Bitte fülle alle markierten Pflichtfelder aus.'));
      return;
    }
    if (!formData.privacyAccepted) {
      setErrorMsg(t('Bitte bestätige die Datenschutzhinweise.'));
      return;
    }
    setErrorMsg(null);
    window.open(whatsappUrl(), '_blank', 'noopener');
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Digitaler Geräte-Check-in')}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-[#0B1315] border border-[#C9743F]/40 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('Schließen')}
          className="absolute top-5 end-5 text-[#839897] hover:text-[#00F5D4] transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="mb-6">
              <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-wider block mb-1">
                // {t('Papierloser Werkstatt-Check-In')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {t('Geräte-Check-in & Datenschutzvereinbarung')}
              </h3>
              <p className="text-xs sm:text-sm text-[#839897] mt-1 leading-relaxed">
                {t('Trage die Daten deines Geräts vorab online ein. Das spart Papier, Wartezeit und sichert deine Privatsphäre nachweisbar ab.')}
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
                  <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                    {t('Vor- & Nachname')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('z. B. Markus Schmidt')}
                    className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                    {t('Telefon / WhatsApp')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('z. B. 0176 12345678')}
                    className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                  {t('Gerätemodell & Farbe')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                  placeholder={t('z. B. PS5 Disc Edition, MacBook Pro A2141, BMW F30 Funkschlüssel')}
                  className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                  {t('Fehlerbeschreibung')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.fault}
                  onChange={(e) => setFormData({ ...formData, fault: e.target.value })}
                  placeholder={t('Was genau passiert? Geht das Gerät aus, wackelt der Anschluss, gibt es Bildfehler?')}
                  className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                  {t('Vorhandene Vorschäden (Kratzer, Risse, Dellen)')}
                </label>
                <input
                  type="text"
                  value={formData.preDamages}
                  onChange={(e) => setFormData({ ...formData, preDamages: e.target.value })}
                  placeholder={t('z. B. feine Kratzer auf Unterseite (frei lassen falls keine)')}
                  className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer bg-[#00F5D4]/[0.06] border border-[#00F5D4]/25 rounded-xl px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={formData.loanerWanted}
                  onChange={(e) => setFormData({ ...formData, loanerWanted: e.target.checked })}
                  className="w-4 h-4 accent-[#00F5D4] rounded mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-[#F3F7F7]">
                  <strong>{t('Leihgerät gewünscht')}</strong>
                  <span className="block text-[#839897] mt-0.5">
                    {t('Für Controller: Leih-Controller gegen Pfand, solange verfügbar.')}
                  </span>
                </span>
              </label>

              {/* Privacy protocol notice */}
              <div className="bg-[#05090A] border border-[#C9743F]/30 border-s-3 border-s-[#00F5D4] rounded-xl p-4 text-xs text-[#839897] leading-relaxed space-y-1 font-mono">
                <div className="text-[#00F5D4] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('CODE – Datenschutz- & Diskretions-Garantie (DSGVO)')}</span>
                </div>
                <p>• <strong>{t('PIN/Passcode:')}</strong> {t('Wird ausschließlich mündlich bei Übergabe besprochen – niemals online übertragen.')}</p>
                <p>• <strong>{t('100% Diskretion:')}</strong> {t('Kein Zugriff auf private Fotos, Chats, Mails oder vertrauliche Firmendaten.')}</p>
                <p>• <strong>{t('Kein Cloud-Upload:')}</strong> {t('Deine Daten verlassen zu keinem Zeitpunkt unsere isolierten Teststationen.')}</p>
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                  className="w-4 h-4 accent-[#FF8D4D] rounded mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-[#F3F7F7]">
                  {t('Ich bestätige die Richtigkeit der Angaben und habe die Datenschutzhinweise gelesen. Der Reparaturauftrag kommt erst nach Prüfung und Kostenfreigabe zustande.')} *
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#00F5D4] text-[#060B0C] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>{t('Check-in per WhatsApp senden')}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/15 border border-[#25D366] text-[#25D366] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{t('Fast geschafft!')}</h3>
              <p className="text-sm text-[#A3B5B6] max-w-md mx-auto leading-relaxed">
                {t('Deine Angaben sind in WhatsApp vorbereitet.')}{' '}
                <strong className="text-white">{t('Tippe dort nur noch auf „Senden“')}</strong>{' – '}
                {t('dann meldet sich Mustafa mit einem Abgabetermin und deiner Auftragsnummer.')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 transition-all"
              >
                <Send className="w-4 h-4" />
                {t('WhatsApp erneut öffnen')}
              </a>
              <a
                href={mailUrl()}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold border border-white/15 text-white hover:border-[#00F5D4]/60 transition-colors"
              >
                {t('Stattdessen per E-Mail senden')}
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#839897] hover:text-white underline underline-offset-4 cursor-pointer"
            >
              {t('Fenster schließen')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
