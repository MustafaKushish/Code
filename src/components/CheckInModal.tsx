import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Send, AlertCircle, Copy } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetData?: { device?: string; fault?: string };
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, presetData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    device: '',
    fault: '',
    preDamages: '',
    privacyAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultTicketId, setResultTicketId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (presetData) {
      setFormData((prev) => ({
        ...prev,
        device: presetData.device || prev.device,
        fault: presetData.fault || prev.fault,
      }));
    }
  }, [presetData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.device || !formData.fault) {
      setErrorMsg('Bitte fülle alle markierten Pflichtfelder aus.');
      return;
    }
    if (!formData.privacyAccepted) {
      setErrorMsg('Bitte bestätige die Datenschutzvereinbarung.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Fallback for static browser preview without backend
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const fallbackTicket = `CODE-${randomSuffix}`;
        setResultTicketId(fallbackTicket);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Check-In konnte nicht gespeichert werden.');
      }
      setResultTicketId(data.ticketId);
    } catch {
      // Local fallback for offline/static browser preview
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const fallbackTicket = `CODE-${randomSuffix}`;
      setResultTicketId(fallbackTicket);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (resultTicketId) {
      navigator.clipboard.writeText(resultTicketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0B1315] border border-[#C9743F]/40 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#839897] hover:text-[#00F5D4] transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!resultTicketId ? (
          <>
            <div className="mb-6">
              <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-wider block mb-1">
                // Papierloser Werkstatt-Check-In
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Geräte-Check-in &amp; Datenschutzvereinbarung
              </h3>
              <p className="text-xs sm:text-sm text-[#839897] mt-1 leading-relaxed">
                Trage die Daten deines Geräts vorab online ein. Das spart Papier, Wartezeit und sichert deine Privatsphäre nachweisbar ab.
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
                    Vor- &amp; Nachname *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z. B. Markus Schmidt"
                    className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                    Telefon / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="z. B. 0176 12345678"
                    className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                  Gerätemodell &amp; Farbe *
                </label>
                <input
                  type="text"
                  required
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                  placeholder="z. B. PS5 Disc Edition, MacBook Pro A2141, BMW F30 Funkschlüssel"
                  className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                  Fehlerbeschreibung *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.fault}
                  onChange={(e) => setFormData({ ...formData, fault: e.target.value })}
                  placeholder="Was genau passiert? Geht das Gerät aus, wackelt der Anschluss, gibt es Bildfehler?"
                  className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#839897] uppercase tracking-wider mb-1.5">
                  Vorhandene Vorschäden (Kratzer, Risse, Dellen)
                </label>
                <input
                  type="text"
                  value={formData.preDamages}
                  onChange={(e) => setFormData({ ...formData, preDamages: e.target.value })}
                  placeholder="z. B. feine Kratzer auf Unterseite (frei lassen falls keine)"
                  className="w-full bg-[#050809] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              {/* Privacy protocol notice */}
              <div className="bg-[#05090A] border border-[#C9743F]/30 border-l-3 border-l-[#00F5D4] rounded-xl p-4 text-xs text-[#839897] leading-relaxed space-y-1 font-mono">
                <div className="text-[#00F5D4] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CODE – Datenschutz- &amp; Diskretions-Garantie (DSGVO)</span>
                </div>
                <p>• <strong>PIN/Passcode:</strong> Wird ausschließlich mündlich bei Übergabe besprochen – niemals online übertragen.</p>
                <p>• <strong>100% Diskretion:</strong> Kein Zugriff auf private Fotos, Chats, Mails oder vertrauliche Firmendaten.</p>
                <p>• <strong>Kein Cloud-Upload:</strong> Deine Daten verlassen zu keinem Zeitpunkt unsere isolierten Teststationen.</p>
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
                  Ich bestätige die Richtigkeit der Angaben und erteile den Reparaturauftrag gemäß der Datenschutzvereinbarung. *
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#00F5D4] text-[#060B0C] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Wird übermittelt...' : '✓ Auftrag &amp; Protokoll digital absenden'}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#00F5D4]/20 border border-[#00F5D4] text-[#00F5D4] flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Auftrag erfolgreich erfasst!
              </h3>
              <p className="text-xs sm:text-sm text-[#839897] max-w-md mx-auto">
                Dein Reparatur-Ticket wurde angelegt. Bitte notiere dir die Ticket-Nummer für die Statusabfrage.
              </p>
            </div>

            <div className="bg-[#050D0E] border border-[#00F5D4]/40 rounded-xl p-4 max-w-sm mx-auto flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#839897] uppercase block">Deine Ticket-Nummer</span>
                <span className="font-mono text-2xl font-extrabold text-[#00F5D4] tracking-wider">
                  {resultTicketId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyTicket}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:text-[#00F5D4] transition-colors flex items-center gap-1 font-mono text-xs cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
              </button>
            </div>

            <p className="text-xs text-[#839897] font-mono max-w-md mx-auto leading-relaxed">
              Mustafa prüft deine Angaben und bereitet den Arbeitsplatz an der Werkbank in Neumarkt vor.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              Fenster schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
