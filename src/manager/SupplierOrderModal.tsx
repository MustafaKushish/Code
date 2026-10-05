import React, { useState } from 'react';
import { X, ShoppingCart, Building2, Copy, Check, PackageCheck, Printer } from 'lucide-react';
import { InventoryItem, WorkshopSettings } from './types';

interface SupplierOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  workshopSettings: WorkshopSettings;
}

export const SupplierOrderModal: React.FC<SupplierOrderModalProps> = ({
  isOpen,
  onClose,
  inventory,
  workshopSettings,
}) => {
  const [copiedSupplier, setCopiedSupplier] = useState<string | null>(null);

  if (!isOpen) return null;

  const lowStockItems = inventory.filter((item) => (item.qty || 0) <= (item.minQty || 1));

  // Group by supplier
  const supplierGroups: Record<string, InventoryItem[]> = {};
  lowStockItems.forEach((item) => {
    const sName = item.supplier?.trim() || 'Allgemeiner Großhandel';
    if (!supplierGroups[sName]) supplierGroups[sName] = [];
    supplierGroups[sName].push(item);
  });

  const estimatedTotalCost = lowStockItems.reduce(
    (sum, item) => sum + Math.max(1, item.minQty * 3 - item.qty) * (item.ek || 0),
    0
  );

  const handleCopyOrderText = (supplierName: string, items: InventoryItem[]) => {
    let text = `BESTELLUNG ERSATZTEILE — ${workshopSettings.workshopName || 'CODE IT-Werkstatt'}\n`;
    text += `Datum: ${new Date().toLocaleDateString('de-DE')}\n`;
    text += `Lieferant: ${supplierName}\n\n`;
    text += `POSITIONEN:\n`;

    items.forEach((item, index) => {
      const suggestQty = Math.max(1, item.minQty * 3 - item.qty);
      text += `${index + 1}. [${item.id}] ${item.name} — Menge: ${suggestQty} Stück (Ist: ${item.qty}, Min: ${item.minQty})\n`;
    });

    text += `\nBitte um schnellstmögliche Lieferung & Rechnung an: ${workshopSettings.email || 'info@code-ger.com'}\n`;

    navigator.clipboard.writeText(text);
    setCopiedSupplier(supplierName);
    setTimeout(() => setCopiedSupplier(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#0B1416] border border-[#00F5D4]/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white">
              Automatische Lieferanten-Bestellliste
            </h3>
            <p className="text-[11px] font-mono text-[#00F5D4] font-bold">
              // EINKAUFSVORSCHLÄGE FÜR MINDESTBESTÄNDE
            </p>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#040809] border border-white/10 mb-5 font-mono text-xs">
          <div>
            <span className="text-[#859B9E] text-[10px] uppercase block">Nachzubestellende Teile:</span>
            <span className="text-white font-bold text-base">{lowStockItems.length} Positionen</span>
          </div>
          <div>
            <span className="text-[#859B9E] text-[10px] uppercase block">Betroffene Lieferanten:</span>
            <span className="text-white font-bold text-base">{Object.keys(supplierGroups).length} Lieferanten</span>
          </div>
          <div>
            <span className="text-[#859B9E] text-[10px] uppercase block">Geschätzter EK-Warenwert:</span>
            <span className="text-[#00F5D4] font-bold text-base">~{estimatedTotalCost.toFixed(2)} €</span>
          </div>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="p-8 text-center bg-[#040809] border border-dashed border-white/10 rounded-xl font-mono text-xs mb-5">
            <PackageCheck className="w-8 h-8 text-[#00E676] mx-auto mb-2 opacity-80" />
            <p className="text-white font-bold mb-1">Alle Ersatzteile ausreichend auf Lager!</p>
            <p className="text-gray-400">Kein Artikel hat aktuell den definierten Mindestbestand unterschritten.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1 mb-5">
            {Object.keys(supplierGroups).map((sName) => {
              const items = supplierGroups[sName];
              const groupEk = items.reduce(
                (sum, item) => sum + Math.max(1, item.minQty * 3 - item.qty) * (item.ek || 0),
                0
              );
              const isCopied = copiedSupplier === sName;

              return (
                <div key={sName} className="rounded-xl border border-white/10 bg-[#040809] overflow-hidden shadow-md">
                  <div className="bg-[#0e1b1e] p-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#00F5D4]" />
                      <strong className="text-white font-mono text-xs uppercase">{sName}</strong>
                      <span className="text-[10px] font-mono text-[#859B9E] bg-white/5 px-2 py-0.5 rounded">
                        {items.length} Artikel (~{groupEk.toFixed(2)} € EK)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyOrderText(sName, items)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Kopiert!' : 'Bestelltext kopieren'}</span>
                    </button>
                  </div>

                  <div className="divide-y divide-white/5 font-mono text-xs">
                    {items.map((item) => {
                      const suggestQty = Math.max(1, item.minQty * 3 - item.qty);
                      const totalPartCost = suggestQty * item.ek;
                      return (
                        <div key={item.id} className="p-3 flex items-center justify-between gap-3 hover:bg-white/[0.02]">
                          <div>
                            <span className="text-[#00F5D4] font-bold mr-2">[{item.id}]</span>
                            <span className="text-white font-bold">{item.name}</span>
                            <div className="text-[11px] text-[#859B9E]">
                              Kategorie: {item.category} • Einzel-EK: {item.ek.toFixed(2)} €
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[11px] text-gray-400">
                              Bestand: <span className="text-red-400 font-bold">{item.qty}</span> / Min: {item.minQty}
                            </div>
                            <div className="text-[#00E676] font-bold">
                              Bestellvorschlag: <strong className="text-white text-sm">{suggestQty} Stk</strong> (~{totalPartCost.toFixed(2)} €)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white/5 border border-white/15 text-white hover:bg-white/10 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#00F5D4]" />
            <span>Einkaufsliste drucken</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-[#00F5D4] text-black hover:bg-[#00F5D4]/85 transition cursor-pointer shadow-lg shadow-[#00F5D4]/20"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
