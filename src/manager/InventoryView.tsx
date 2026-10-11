import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  ShoppingCart,
  AlertTriangle,
  Download,
  Trash2,
} from 'lucide-react';
import { InventoryItem, User, AdminAuthRequest } from './types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  currentUser: User | null;
  onAddPart: (part: Omit<InventoryItem, 'id'>) => void;
  onAdjustStock: (id: string, delta: number) => void;
  onDeletePart: (id: string) => void;
  onRequestAdminAuth: (request: AdminAuthRequest) => void;
  onOpenSupplierOrder: () => void;
  onClearAllInventory?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  currentUser,
  onAddPart,
  onAdjustStock,
  onDeletePart,
  onRequestAdminAuth,
  onOpenSupplierOrder,
  onClearAllInventory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [partToDelete, setPartToDelete] = useState<InventoryItem | null>(null);

  // New part inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Konsole');
  const [qty, setQty] = useState(1);
  const [minQty, setMinQty] = useState(2);
  const [ek, setEk] = useState(0);
  const [supplier, setSupplier] = useState('');

  // Calculations
  let totalStockVal = 0;
  let totalSalesPotential = 0;
  let totalPieces = 0;
  let reorderCount = 0;

  inventory.forEach((item) => {
    const q = item.qty || 0;
    const itemVal = q * (item.ek || 0);
    const itemSales = itemVal * 1.5;
    totalStockVal += itemVal;
    totalSalesPotential += itemSales;
    totalPieces += q;
    if (q <= item.minQty) reorderCount++;
  });

  const filteredItems = inventory.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.supplier && item.supplier.toLowerCase().includes(q));

    if (onlyLowStock) {
      return matchesSearch && item.qty <= item.minQty;
    }
    return matchesSearch;
  });

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Bitte einen Teilenamen eingeben.');
      return;
    }
    onAddPart({
      name: name.trim(),
      category,
      qty: Number(qty) || 0,
      minQty: Number(minQty) || 0,
      ek: Number(ek) || 0,
      supplier: supplier.trim() || undefined,
    });
    setName('');
    setQty(1);
    setEk(0);
    setSupplier('');
  };

  const handleExportCsv = () => {
    if (inventory.length === 0) {
      alert('Kein Lagerbestand zum Exportieren.');
      return;
    }
    let csv = 'Teilename;Kategorie;Bestand_Stk;Mindestbestand;EK_Preis_EUR;Gesamtwert_EK_EUR;Lieferant\n';
    inventory.forEach((item) => {
      const val = item.qty * item.ek;
      csv += `"${item.name.replace(/"/g, '""')}";"${item.category}";"${item.qty}";"${item.minQty}";"${item.ek.toFixed(2)}";"${val.toFixed(2)}";"${(item.supplier || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CODE_Lagerbestand_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fmtEuro = (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€';

  const renderStock = (item: InventoryItem, isLow: boolean) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onAdjustStock(item.id, -1)}
        className="w-9 h-9 md:w-6 md:h-6 rounded bg-white/10 hover:bg-[#FF5252]/20 hover:text-[#FF5252] flex items-center justify-center font-bold text-sm cursor-pointer transition"
        title="1 Stück abbuchen"
      >
        −
      </button>
      <span
        className={`font-bold px-2 py-0.5 rounded ${
          isLow
            ? 'bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/50'
            : 'bg-[#00E676]/10 text-[#00E676]'
        }`}
      >
        {item.qty} {isLow && '⚠️'}
      </span>
      <button
        type="button"
        onClick={() => onAdjustStock(item.id, 1)}
        className="w-9 h-9 md:w-6 md:h-6 rounded bg-white/10 hover:bg-[#00E676]/20 hover:text-[#00E676] flex items-center justify-center font-bold text-sm cursor-pointer transition"
        title="1 Stück zubuchen"
      >
        +
      </button>
    </div>
  );

  const renderDelete = (item: InventoryItem) => (
    <button
      type="button"
      onClick={() => {
        if (currentUser?.role === 'admin' || currentUser?.canDelete === true) {
          setPartToDelete(item);
        } else {
          onRequestAdminAuth({
            type: 'DELETE_PART',
            title: 'Ersatzteil löschen',
            description:
              'Mitarbeiter dürfen Ersatzteile nicht ohne Bestätigung aus dem Lager löschen. Zur Freigabe dieser Löschung ist das Passwort/PIN des Administrators erforderlich.',
            itemDetails: `Artikel: ${item.name} (ID: ${item.id}) | Bestand: ${item.qty} Stk`,
            requiredRole: 'admin',
            onConfirm: () => onDeletePart(item.id),
          });
        }
      }}
      className="p-2.5 md:p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-[#FF5252] transition cursor-pointer"
      title={currentUser?.role === 'admin' ? 'Löschen' : 'Löschen (Admin-Bestätigung erforderlich)'}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#061012] border border-[#C9743F] rounded-xl p-4 shadow-xl">
          <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
            Gesamter Lagerwert (EK Netto)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF8D4D]">
            {totalStockVal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <div className="text-xs font-mono text-[#859B9E] mt-1.5">
            Gebundenes Kapital im Schrank
          </div>
        </div>

        <div className="bg-[#051214] border border-[#00F5D4] rounded-xl p-4 shadow-xl">
          <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
            Verkaufspotenzial (Umsatzwert)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#00F5D4]">
            {totalSalesPotential.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <div className="text-xs font-mono text-[#00E676] mt-1.5">
            Erwarteter Rohertrag: +{(totalSalesPotential - totalStockVal).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
        </div>

        <div className="bg-[#040809] border border-white/10 rounded-xl p-4 shadow-xl">
          <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
            Physischer Lagerbestand
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {totalPieces.toLocaleString('de-DE')} Stk.
          </div>
          <div className="text-xs font-mono text-[#859B9E] mt-1.5">
            in {inventory.length} verschiedenen Artikeln
          </div>
        </div>

        <div className="bg-[#040809] border border-[#FF5252] rounded-xl p-4 shadow-xl">
          <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
            Nachbestell-Bedarf
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF5252]">
            {reorderCount}
          </div>
          <div className="text-xs font-mono text-[#FF5252] mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 inline" />
            <span>Artikel unter Mindestbestand</span>
          </div>
        </div>
      </div>

      {/* New Part Creation Form */}
      <div className="bg-[#0B1416] border border-[#C9743F]/30 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/50">
        <h3 className="font-mono text-sm font-bold text-[#00F5D4] uppercase tracking-wide border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#C9743F]" />
          <span>Neues Ersatzteil anlegen / Bestand aufstocken</span>
        </h3>
        <form onSubmit={handleCreatePart} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Teilename:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. PS5 HDMI-Port OEM oder DualSense Hall-Effect Stick"
                className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Kategorie:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
              >
                <option>Konsole</option>
                <option>Controller</option>
                <option>Laptop / PC</option>
                <option>Smartphone</option>
                <option>Autoschlüssel</option>
                <option>Verbrauchsmaterial</option>
                <option>Donor Board (Spender)</option>
                <option>Sonstiges</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Bestand (Stk.):
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={qty}
                onChange={(e) => setQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Warnung ab (Min.):
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={minQty}
                onChange={(e) => setMinQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                EK-Preis (€ Netto):
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={ek}
                onChange={(e) => setEk(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Lieferant:
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="z. B. Mobilsentrix / Autel"
                className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono font-bold text-xs uppercase bg-[#C9743F] text-white hover:bg-[#FF8D4D] transition shadow-md shadow-[#C9743F]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Teil anlegen / Bestand hinzufügen</span>
          </button>
        </form>
      </div>

      {/* Inventory List */}
      <div className="bg-[#0B1416] border border-[#C9743F]/25 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Teil, Kategorie oder Lieferant suchen..."
              className="w-full bg-[#040809] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-[#00F5D4] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenSupplierOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-sm"
              title="Automatische Einkaufsliste nach Lieferanten aufrufen"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>🛒 Einkaufsliste ({reorderCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                onlyLowStock
                  ? 'bg-[#FF5252]/20 border-[#FF5252] text-[#FF5252]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:border-[#FF5252]/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Nur Nachbestellungen ({reorderCount})</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#C9743F]/20 border border-[#C9743F] text-[#FF8D4D] hover:bg-[#C9743F] hover:text-white transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {onClearAllInventory && inventory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Möchtest du wirklich alle Artikel aus dem Lager und der Cloud löschen?')) {
                    onClearAllInventory();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
                title="Lagerbestand komplett leeren"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Lager leeren</span>
              </button>
            )}
          </div>
        </div>

        {/* Handy: Karten statt breiter Tabelle */}
        <div className="md:hidden space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="p-6 border border-white/10 rounded-xl text-center text-xs font-mono text-[#859B9E]">Keine Teile gefunden.</div>
          ) : (
            filteredItems.map((item) => {
              const isLow = item.qty <= item.minQty;
              return (
                <article key={item.id} className="border border-white/10 rounded-xl bg-[#080E10] p-3 font-mono text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="text-white block break-words">{item.name}</strong>
                      <div className="text-[11px] text-[#859B9E]">
                        {item.category}
                        {item.supplier ? ` · ${item.supplier}` : ''}
                      </div>
                    </div>
                    {renderDelete(item)}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2.5">
                    {renderStock(item, isLow)}
                    <div className="text-right text-[11px] text-[#859B9E]">
                      <div>Min. {item.minQty} · EK {fmtEuro(item.ek)}</div>
                      <div className="font-bold text-[#FF8D4D]">Wert {fmtEuro(item.qty * item.ek)}</div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="hidden md:block overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[700px]">
            <thead className="bg-[#050A0C] text-[#00F5D4] border-b border-white/10">
              <tr>
                <th className="p-3">Teil</th>
                <th className="p-3">Kategorie</th>
                <th className="p-3">Bestand</th>
                <th className="p-3">Mindestbestand</th>
                <th className="p-3">EK / Stk.</th>
                <th className="p-3">Gesamtwert (EK)</th>
                <th className="p-3">Lieferant</th>
                <th className="p-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-[#859B9E]">
                    Keine Teile gefunden.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.qty <= item.minQty;
                  const totalEk = item.qty * item.ek;
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-white flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#00F5D4]" />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-3 text-gray-300">{item.category}</td>
                      <td className="p-3">
                        {renderStock(item, isLow)}
                      </td>
                      <td className="p-3 text-gray-400">{item.minQty}</td>
                      <td className="p-3 text-white">
                        {item.ek.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="p-3 font-bold text-[#FF8D4D]">
                        {totalEk.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="p-3 text-gray-400">{item.supplier || '–'}</td>
                      <td className="p-3 text-right">
                        {renderDelete(item)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] font-mono text-[#859B9E] mt-3">
          💡 <strong>Automatisches Lagerbuch:</strong> Wählst du im Kalkulator ein Teil aus dem Lager und speicherst den Auftrag ab, wird der Bestand automatisch um 1 Stück abgebucht.
        </p>
      </div>

      {/* Delete Part Confirmation Modal */}
      {partToDelete && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0B1416] border border-[#FF5252] rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-red-950/50 relative">
            <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/50 flex items-center justify-center text-[#FF5252] mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-mono text-base font-black text-white mb-1">
              Ersatzteil aus Lager löschen?
            </h3>
            <p className="text-xs font-mono text-[#859B9E] mb-4">
              Dieses Ersatzteil wird dauerhaft aus dem Werkstatt-Lager entfernt.
            </p>
            <div className="p-3 bg-[#040809] border border-white/10 rounded-xl font-mono text-xs text-white space-y-1 mb-5">
              <div>
                <strong>Artikel:</strong> {partToDelete.name}
              </div>
              <div>
                <strong>Kategorie:</strong> {partToDelete.category}
              </div>
              <div>
                <strong>Aktueller Bestand:</strong>{' '}
                <span className="text-[#00F5D4] font-bold">{partToDelete.qty} Stk</span>
              </div>
              <div>
                <strong>Einkaufspreis (EK):</strong> {partToDelete.ek.toFixed(2)} €
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPartToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-300 hover:text-white border border-white/10 transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePart(partToDelete.id);
                  setPartToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-[#FF5252] text-white hover:bg-red-600 transition cursor-pointer shadow-lg shadow-red-500/20"
              >
                Ja, Teil löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
