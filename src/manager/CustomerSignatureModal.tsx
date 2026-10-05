import React, { useRef, useState, useEffect } from 'react';
import { X, PenTool, RotateCcw, Check } from 'lucide-react';
import { Order, WorkshopSettings } from './types';

interface CustomerSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  workshopSettings: WorkshopSettings;
  onSaveSignature: (orderId: string, signatureDataUrl: string) => void;
}

export const CustomerSignatureModal: React.FC<CustomerSignatureModalProps> = ({
  isOpen,
  onClose,
  order,
  workshopSettings,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setHasDrawn(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setErrorMsg(null);
    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      setErrorMsg(null);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      setErrorMsg('Bitte zuerst auf dem Feld unterschreiben.');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(order.id, dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#0B1416] border border-[#00F5D4]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white">
              Digitale Kundenunterschrift
            </h3>
            <p className="text-[11px] font-mono text-[#00F5D4] font-bold">
              // RECHTLICHE GERÄTEANNAHME FÜR {order.id}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#040809] border border-white/10 mb-4 text-[11px] font-mono text-[#859B9E] leading-relaxed">
          <p className="text-white font-bold mb-1">
            Einverständniserklärung zur Reparaturannahme:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Der Kunde bestätigt die Übergabe von <strong>{order.device}</strong> (Kunde: {order.cust}).
            </li>
            <li>Für nicht gesicherte Daten übernimmt die Werkstatt keine Haftung.</li>
            <li>Bei Vorschäden (z. B. Flüssigkeit, Sturz) wird die Reparatur nach bestem Ermessen ausgeführt.</li>
          </ul>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#859B9E] mb-1.5">
            <span>Bitte hier mit Finger, Stift oder Maus unterschreiben:</span>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Löschen</span>
            </button>
          </div>

          <div className="border-2 border-[#00F5D4]/50 rounded-xl overflow-hidden bg-white shadow-inner">
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="w-full h-44 touch-none cursor-crosshair block"
            />
          </div>

          {errorMsg && (
            <div className="mt-2 text-xs font-mono text-[#FF5252] bg-red-950/30 p-2 rounded-lg border border-red-500/40">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-[#00F5D4] text-black hover:bg-[#00F5D4]/85 transition cursor-pointer shadow-lg shadow-[#00F5D4]/20"
          >
            <Check className="w-4 h-4 text-black" />
            <span>Unterschrift übernehmen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
