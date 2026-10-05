import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon, CloudUpload, Trash2 } from 'lucide-react';
import { Order, OrderPhoto } from './types';

interface OrderPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSavePhotos: (orderId: string, photos: OrderPhoto[]) => void;
}

export const OrderPhotosModal: React.FC<OrderPhotosModalProps> = ({
  isOpen,
  onClose,
  order,
  onSavePhotos,
}) => {
  const [photos, setPhotos] = useState<OrderPhoto[]>(() => order?.photos || []);
  const [caption, setCaption] = useState('Vorher (Schadensbild)');
  const [fullViewUrl, setFullViewUrl] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize for offline local storage preservation
          if (width > height && width > 900) {
            height = Math.round((height * 900) / width);
            width = 900;
          } else if (height > 900) {
            width = Math.round((width * 900) / height);
            height = 900;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.75);

            const newPhoto: OrderPhoto = {
              id: 'IMG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              url: dataUrl,
              caption,
              timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            };

            const updated = [...photos, newPhoto];
            setPhotos(updated);
            onSavePhotos(order.id, updated);
          }
        };
        img.src = uploadEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter((p) => p.id !== photoId);
    setPhotos(updated);
    onSavePhotos(order.id, updated);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#0B1416] border border-[#FF8D4D]/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#C9743F]/20 border border-[#FF8D4D]/50 flex items-center justify-center text-[#FF8D4D]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white">
              Fotodokumentation &amp; Schadensprotokoll
            </h3>
            <p className="text-[11px] font-mono text-[#FF8D4D] font-bold">
              // VORHER / NACHHER &amp; MIKROSKOP-BILDER FÜR {order.id}
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <div className="p-4 rounded-xl bg-[#040809] border border-white/10 mb-5">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-mono text-[#859B9E] uppercase mb-1">
                Kategorie / Beschreibung des Fotos:
              </label>
              <select
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-[#0B1416] border border-white/15 text-white rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#FF8D4D]"
              >
                <option value="Vorher (Gehäuseschaden / Zustand Annahme)">Vorher (Gehäuseschaden / Zustand Annahme)</option>
                <option value="Mikroskop (SMD-Lötstelle / abgerissene Pads)">Mikroskop (SMD-Lötstelle / abgerissene Pads)</option>
                <option value="Kurzschluss / Brandstelle (19V / Spule)">Kurzschluss / Brandstelle (19V / Spule)</option>
                <option value="Nachher (Fertige Lötstelle / gereinigt)">Nachher (Fertige Lötstelle / gereinigt)</option>
                <option value="Funktionstest (Display / Signal Output)">Funktionstest (Display / Signal Output)</option>
              </select>
            </div>

            <div className="pt-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#FF8D4D] text-black hover:bg-[#FF8D4D]/85 transition cursor-pointer shadow-md">
                <CloudUpload className="w-4 h-4" />
                <span>Foto aufnehmen / hochladen</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <p className="text-[10px] font-mono text-[#859B9E]">
            💡 Fotos werden automatisch für den Offline-Betrieb optimiert und sicher am Auftrag hinterlegt.
          </p>
        </div>

        {/* Photos Grid */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-mono text-[#859B9E] mb-2">
            <span>Gespeicherte Bilder ({photos.length})</span>
            {photos.length > 0 && <span className="text-[#00E676] font-bold">✓ Im Auftrag hinterlegt</span>}
          </div>

          {photos.length === 0 ? (
            <div className="p-8 text-center bg-[#040809] border border-dashed border-white/10 rounded-xl text-gray-500 font-mono text-xs">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
              <p className="text-gray-300 font-bold mb-1">Noch keine Fotos hinzugefügt</p>
              <p className="text-[11px]">Fotografieren Sie Gehäuse oder Mikroskop-Bilder zur Absicherung.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative group bg-[#040809] border border-white/10 rounded-xl overflow-hidden shadow-md"
                >
                  <img
                    src={p.url}
                    alt={p.caption}
                    onClick={() => setFullViewUrl(p.url)}
                    className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition duration-300"
                  />
                  <div className="p-2 text-[10px] font-mono bg-[#0B1416] border-t border-white/5">
                    <div className="text-white font-bold truncate">{p.caption}</div>
                    <div className="text-[#859B9E] flex items-center justify-between mt-0.5">
                      <span>{p.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(p.id)}
                        className="text-gray-500 hover:text-red-400 transition cursor-pointer p-0.5"
                        title="Foto löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer"
          >
            Fertigstellen &amp; Schließen
          </button>
        </div>

        {/* Full Image Zoom Modal */}
        {fullViewUrl && (
          <div
            onClick={() => setFullViewUrl(null)}
            className="fixed inset-0 z-[100010] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-3xl max-h-[85vh]">
              <img
                src={fullViewUrl}
                alt="Großansicht"
                className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/20"
              />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white font-mono text-xs px-3 py-1 rounded-full">
                Klicken zum Schließen
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
