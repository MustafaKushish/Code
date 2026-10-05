import React, { useState } from 'react';
import { X, MessageCircle, Check, Copy, Send } from 'lucide-react';
import { Order, WorkshopSettings } from './types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  workshopSettings: WorkshopSettings;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  order,
  workshopSettings,
}) => {
  const [template, setTemplate] = useState<'ready' | 'kva' | 'in_progress' | 'review' | 'custom'>('ready');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  // Format phone to clean international format without spaces
  const cleanPhone = (phoneStr: string) => {
    let p = phoneStr.replace(/[^0-9+]/g, '');
    if (p.startsWith('0')) {
      p = '49' + p.substring(1);
    } else if (p.startsWith('+')) {
      p = p.substring(1);
    }
    return p;
  };

  const toPhone = cleanPhone(order.phone || '');
  const workshopName = workshopSettings.workshopName || 'CODE // IT-Werkstatt';
  const totalFormatted = order.brutto.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const liveTrackerUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://code-ger.com'}/?ticket=${order.id}#tracker`;

  const getMessageText = () => {
    switch (template) {
      case 'ready':
        return `Hallo ${order.cust},

gute Nachrichten! Ihre Reparatur für ${order.device} (Auftrag ${order.id}) ist erfolgreich abgeschlossen, getestet und abholbereit.

🔍 Live-Reparaturbericht ansehen:
${liveTrackerUrl}

💶 Rechnungsbetrag: ${totalFormatted} € (${
          order.paid === 'Bezahlt' ? 'Bereits bezahlt ✅' : 'Zahlbar bei Abholung'
        })

📍 Abholort: ${workshopSettings.address || '92318 Neumarkt in der Oberpfalz'}

Wir freuen uns auf Ihren Besuch!
Ihr Team von ${workshopName}`;

      case 'kva':
        return `Hallo ${order.cust},

die Fehlerdiagnose für Ihr Gerät (${order.device}, Auftrag ${order.id}) ist abgeschlossen.

📋 Kostenvoranschlag:
Gesamtreparatur: ${totalFormatted} € inkl. MwSt., Arbeitszeit und Qualitäts-Ersatzteile.

🔍 Details online prüfen:
${liveTrackerUrl}

Bitte geben Sie uns kurz Bescheid, ob wir die Reparatur so durchführen dürfen.

Viele Grüße,
${workshopName}`;

      case 'in_progress':
        return `Hallo ${order.cust},

ein kurzes Update zu Ihrem Reparaturauftrag (${order.id}): Die benötigten Ersatzteile für Ihr Gerät (${order.device}) sind eingetroffen und die Reparatur befindet sich aktuell in Bearbeitung auf der Werkbank.

🔍 Live-Status verfolgen:
${liveTrackerUrl}

Wir melden uns, sobald der abschließende Funktionstest beendet ist!

${workshopName}`;

      case 'review':
        return `Hallo ${order.cust},

vielen Dank für Ihr Vertrauen in unsere Werkstatt ${workshopName} in Neumarkt! Ihr Gerät (${order.device}) wurde erfolgreich instandgesetzt.

Wenn Sie mit unserer Reparatur und unserem Service zufrieden waren, würden wir uns riesig über eine kurze 5-Sterne-Bewertung auf Google freuen:
⭐⭐⭐⭐⭐
https://g.page/r/code-it-neumarkt/review

Das hilft unserem lokalen Meisterbetrieb enorm weiter. Vielen Dank und beste Grüße!
${workshopName}`;

      case 'custom':
        return customText;
    }
  };

  const message = getMessageText();
  const waUrl = `https://wa.me/${toPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0B1416] border border-[#00E676]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-green-950/30 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-[#00E676]/50 flex items-center justify-center text-[#00E676]">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white">
              WhatsApp-Kundenbenachrichtigung
            </h3>
            <p className="text-[11px] font-mono text-[#00E676] font-bold">
              // 1-KLICK KUNDEN-UPDATE FÜR {order.id}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#040809] border border-white/10 mb-4 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#859B9E] text-[10px] uppercase block">Empfänger:</span>
            <strong className="text-white">{order.cust}</strong>
          </div>
          <div className="text-right">
            <span className="text-[#859B9E] text-[10px] uppercase block">WhatsApp-Nummer:</span>
            <span className="text-[#00F5D4] font-bold">+{toPhone || '–'}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1.5">
            Vorlage auswählen:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setTemplate('ready')}
              className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                template === 'ready'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              ✅ Abholbereit
            </button>
            <button
              type="button"
              onClick={() => setTemplate('kva')}
              className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                template === 'kva'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              📋 KVA
            </button>
            <button
              type="button"
              onClick={() => setTemplate('in_progress')}
              className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                template === 'in_progress'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              🔧 In Arbeit
            </button>
            <button
              type="button"
              onClick={() => setTemplate('review')}
              className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                template === 'review'
                  ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              ⭐ Google Bewertung
            </button>
            <button
              type="button"
              onClick={() => {
                setTemplate('custom');
                if (!customText) setCustomText(`Hallo ${order.cust}, `);
              }}
              className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                template === 'custom'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              ✏️ Freitext
            </button>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1 flex items-center justify-between">
            <span>Nachrichtenvorschau:</span>
            <span className="text-[10px] text-gray-500">Wird an WhatsApp übergeben</span>
          </label>
          {template === 'custom' ? (
            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#040809] border border-[#00E676]/40 text-white font-mono text-xs focus:outline-none focus:border-[#00E676] resize-none"
              placeholder="Eigene Nachricht tippen..."
            />
          ) : (
            <div className="p-3.5 rounded-xl bg-[#051410] border border-[#00E676]/30 text-emerald-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {message}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(message);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white/5 border border-white/10 text-gray-300 hover:text-white transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
            >
              Schließen
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(waUrl, '_blank');
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-[#00E676] hover:bg-[#00E676]/90 text-black transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp öffnen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
