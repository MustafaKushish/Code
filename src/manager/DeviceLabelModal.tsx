import React, { useState, useEffect } from 'react';
import { X, Tag, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { Order, WorkshopSettings } from './types';

interface DeviceLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  workshopSettings: WorkshopSettings;
}

export const DeviceLabelModal: React.FC<DeviceLabelModalProps> = ({
  isOpen,
  onClose,
  order,
  workshopSettings,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (order) {
      const payload = JSON.stringify({
        id: order.id,
        k: order.cust,
        g: order.device,
        s: order.serial || '',
        d: order.date,
      });

      QRCode.toDataURL(payload, {
        width: 180,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Code error:', err));
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    document.body.classList.add('print-mode-label');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-mode-label');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#0B1416] border border-[#00F5D4]/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white">
              Geräte-Begleitschein &amp; Werkstatt-Etikett
            </h3>
            <p className="text-[11px] font-mono text-[#00F5D4] font-bold">
              // REPARATUR-LABEL MIT QR-CODE FÜR DIE WERKBANK
            </p>
          </div>
        </div>

        {/* Printable Label Area */}
        <div
          id="printDeviceLabelArea"
          className="bg-white text-black p-5 rounded-xl border border-gray-300 shadow-inner font-mono text-xs mb-5 select-text"
        >
          <div className="border-b-2 border-black pb-2 mb-3 flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-600">
                {workshopSettings.workshopName || 'CODE // IT-WERKSTATT'}
              </div>
              <div className="text-xl font-black tracking-tight text-black">
                {order.id}
              </div>
              <div className="text-[10px] text-gray-700">
                Annahme: <strong>{order.date}</strong> • Tel: {workshopSettings.phone}
              </div>
            </div>

            <div className="text-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-16 h-16 border border-gray-400 p-0.5 rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex items-center justify-center text-[9px]">
                  QR...
                </div>
              )}
              <span className="text-[8px] uppercase tracking-tighter block text-gray-500 mt-0.5">
                Scan = Öffnen
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-50 p-2.5 rounded border border-gray-200">
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-bold block">Kunde:</span>
              <strong className="text-sm text-black block truncate">{order.cust}</strong>
              <span className="text-[11px] text-gray-700">{order.phone || '–'}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-bold block">Gerät:</span>
              <strong className="text-xs text-black block truncate">{order.device}</strong>
              <span className="text-[10px] text-gray-600 font-mono">S/N: {order.serial || '–'}</span>
            </div>
          </div>

          <div className="mb-3 space-y-1 text-[11px]">
            <div>
              <span className="text-gray-500 font-bold uppercase text-[9px]">Fehlerbeschreibung:</span>
              <div className="text-black bg-white p-1.5 border border-gray-300 rounded font-sans text-xs">
                {order.faultDescription || order.device}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div>
                <span className="text-gray-500 font-bold">Kundenzubehör:</span>{' '}
                <span>{order.accessories || 'Kein Zubehör (Nur Gerät)'}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 font-bold">Status:</span>{' '}
                <span className="font-bold underline">{order.status}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 flex items-center justify-between text-[8px] text-gray-500 leading-tight">
            <div className="max-w-[300px]">
              Gerät zur Überprüfung/Reparatur übergeben. Für ungesicherte Daten oder vorschadensbedingte Spätfolgen (z.B. Flüssigkeit) keine Haftung.
            </div>
            <div className="text-right">
              {order.customerSignature ? (
                <div>
                  <img
                    src={order.customerSignature}
                    alt="Unterschrift"
                    className="h-7 max-w-[90px] inline-block border-b border-black"
                  />
                  <span className="block text-[7px]">Unterschrift Kunde</span>
                </div>
              ) : (
                <div className="w-24 border-b border-gray-400 pt-4 text-center text-[7px]">
                  Unterschrift Kunde
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-[#859B9E]">
            💡 Format: Ideal für DIN A6 oder Etikettendrucker
          </div>
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
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-[#00F5D4] text-black hover:bg-[#00F5D4]/85 transition cursor-pointer shadow-lg shadow-[#00F5D4]/20"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Etikett drucken</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
