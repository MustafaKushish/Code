import React from 'react';
import {
  Calendar,
  Zap,
  ClipboardList,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Package,
  AlertTriangle,
  Scan,
} from 'lucide-react';
import { Order, InventoryItem, User } from './types';
import { WeeklyRevenueChart } from './WeeklyRevenueChart';

interface DashboardViewProps {
  orders: Order[];
  inventory: InventoryItem[];
  currentUser: User | null;
  onNavigateTab: (tab: 'dashboard' | 'calc' | 'orders' | 'appointments' | 'inventory' | 'analytics' | 'ai_diagnose') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  inventory,
  currentUser,
  onNavigateTab,
}) => {
  const todayStr = new Date().toLocaleDateString('de-DE');

  // Filter today's orders
  const todayOrders = orders.filter((o) => o.date === todayStr);
  const todayBrutto = todayOrders.reduce((acc, o) => acc + (o.brutto || 0), 0);
  const todayNetto = todayOrders.reduce((acc, o) => acc + (o.netto || 0), 0);
  const todayProfit = todayOrders.reduce((acc, o) => acc + (o.profit || 0), 0);

  // Paid sums
  const todayPaid = todayOrders.filter((o) => o.paid === 'Bezahlt').reduce((acc, o) => acc + (o.brutto || 0), 0);
  const barSum = todayOrders.filter((o) => o.payMethod?.toLowerCase().includes('bar')).reduce((acc, o) => acc + o.brutto, 0);
  const cardSum = todayOrders.filter((o) => o.payMethod?.toLowerCase().includes('ec') || o.payMethod?.toLowerCase().includes('karte')).reduce((acc, o) => acc + o.brutto, 0);
  const transferSum = todayOrders.filter((o) => o.payMethod?.toLowerCase().includes('überweisung') || o.payMethod?.toLowerCase().includes('rechnung')).reduce((acc, o) => acc + o.brutto, 0);

  // Status groupings
  const openOrders = orders.filter((o) => o.status !== 'Abgeschlossen');
  const stageEingang = openOrders.filter((o) => o.status === 'Eingegangen');
  const stageArbeit = openOrders.filter((o) => o.status === 'In Arbeit');
  const stageTest = openOrders.filter((o) => o.status === 'Fertig / Test');

  // Open unpaid
  const unpaidOrders = orders.filter((o) => o.paid === 'Offen');
  const unpaidTotal = unpaidOrders.reduce((acc, o) => acc + o.brutto, 0);

  // Inventory analysis
  const totalQty = inventory.reduce((acc, item) => acc + (item.qty || 0), 0);
  const totalStockEK = inventory.reduce((acc, item) => acc + (item.qty || 0) * (item.ek || 0), 0);
  const lowStockItems = inventory.filter((item) => (item.qty || 0) <= (item.minQty || 1));

  // Category grouping
  const categoryMap: Record<string, { count: number; qty: number; value: number }> = {};
  inventory.forEach((item) => {
    const cat = item.category || 'Sonstiges';
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, qty: 0, value: 0 };
    categoryMap[cat].count += 1;
    categoryMap[cat].qty += item.qty || 0;
    categoryMap[cat].value += (item.qty || 0) * (item.ek || 0);
  });

  const categories = Object.keys(categoryMap).map((k) => ({
    name: k,
    ...categoryMap[k],
  }));

  const maxQty = Math.max(...categories.map((c) => c.qty), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B1416] via-[#101D20] to-[#0B1416] border border-[#00F5D4]/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#00F5D4]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Heute: {todayStr}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2">
              <span>Werkstatt-Cockpit</span>
              {currentUser && (
                <span className="text-[#FF8D4D] text-base font-normal">
                  // {currentUser.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-[#859B9E] font-mono mt-1">
              Echtzeit-Überblick über heutige Umsätze, anstehende Reparaturen und Lagerkapazitäten.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('appointments')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono font-bold text-xs bg-[#FF8D4D]/15 border border-[#FF8D4D]/40 text-[#FF8D4D] hover:bg-[#FF8D4D] hover:text-black transition cursor-pointer"
              title="Termine & Teile-Vorbereitung öffnen"
            >
              <Calendar className="w-4 h-4" />
              <span>📅 Termine</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono font-bold text-xs bg-[#00F5D4]/15 border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer"
              title="Kamera-Scanner für Reparatur-Etiketten & QR-Codes"
            >
              <Scan className="w-4 h-4" />
              <span>Gerät scannen</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('calc')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs bg-[#00F5D4] text-black hover:bg-[#00F5D4]/85 transition shadow-lg shadow-[#00F5D4]/20 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-black" />
              <span>⚡ Neue Reparatur</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono font-bold text-xs bg-white/5 border border-white/15 text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-[#FF8D4D]" />
              <span>Auftragsbuch</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Kompakte KPI-Kacheln: Tagesumsatz, Offene Aufträge (Anzahl), Lagerbestandswert */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Kachel 1: Tagesumsatz */}
        <div className="bg-[#090F11] border border-[#00F5D4]/30 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-[#00F5D4] transition">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
              Tagesumsatz
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-white">
              {todayBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
            <span className="text-[10px] font-mono text-[#00F5D4] block">
              {todayOrders.length} {todayOrders.length === 1 ? 'Beleg heute' : 'Belege heute'} (Netto: {todayNetto.toFixed(2)} €)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] font-black text-base shadow-sm">
            €
          </div>
        </div>

        {/* Kachel 2: Offene Aufträge (Anzahl) */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#090F11] border border-[#FF8D4D]/30 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-[#FF8D4D] transition cursor-pointer group"
          title="Klicken, um offene Aufträge anzuzeigen"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
              Offene Aufträge
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#FF8D4D] group-hover:scale-105 transition-transform">
              {openOrders.length} {openOrders.length === 1 ? 'Auftrag' : 'Aufträge'}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">
              {stageEingang.length} Neu · {stageArbeit.length} In Arbeit · {stageTest.length} Fertig
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF8D4D]/15 border border-[#FF8D4D]/30 flex items-center justify-center text-[#FF8D4D] shadow-sm">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Kachel 3: Lagerbestandswert */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-[#090F11] border border-[#00E676]/30 rounded-xl p-4 flex items-center justify-between shadow-md hover:border-[#00E676] transition cursor-pointer group"
          title="Klicken, um Ersatzteillager anzuzeigen"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
              Lagerbestandswert
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#00E676] group-hover:scale-105 transition-transform">
              {totalStockEK.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block">
              {totalQty} Teile vorrätig ({inventory.length} Artikel)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-sm">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tagesumsatz Brutto */}
        <div className="bg-[#0B1416] border border-[#C9743F]/35 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#FF8D4D] transition">
          <div className="flex items-center justify-between text-[#859B9E] text-xs font-mono uppercase mb-2">
            <span>Tagesumsatz (Brutto)</span>
            <span className="w-7 h-7 rounded-lg bg-[#C9743F]/20 text-[#FF8D4D] flex items-center justify-center font-bold">
              €
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
            {todayBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <div className="mt-2 text-[11px] font-mono flex items-center justify-between text-[#859B9E]">
            <span>Netto: {todayNetto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
            <span className="text-[#00F5D4] font-bold">{todayOrders.length} {todayOrders.length === 1 ? 'Auftrag' : 'Aufträge'}</span>
          </div>
        </div>

        {/* Tages-Gewinn */}
        <div className="bg-[#0B1416] border border-[#00E676]/35 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#00E676] transition">
          <div className="flex items-center justify-between text-[#859B9E] text-xs font-mono uppercase mb-2">
            <span>Tages-Rohertrag (Gewinn)</span>
            <span className="w-7 h-7 rounded-lg bg-[#00E676]/20 text-[#00E676] flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#00E676] tracking-tight">
            +{todayProfit.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#859B9E]">
            {todayBrutto > 0 ? (
              <span>
                Marge: <strong className="text-white">{(todayProfit / (todayNetto || 1) * 100).toFixed(1)}%</strong> auf Arbeit &amp; Teile
              </span>
            ) : (
              <span>Reiner Werkstatt-Ertrag abzüglich Material</span>
            )}
          </div>
        </div>

        {/* Kassen-Ist */}
        <div className="bg-[#0B1416] border border-[#00F5D4]/35 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#00F5D4] transition">
          <div className="flex items-center justify-between text-[#859B9E] text-xs font-mono uppercase mb-2">
            <span>Kassen-Ist (Heute Bezahlt)</span>
            <span className="w-7 h-7 rounded-lg bg-[#00F5D4]/20 text-[#00F5D4] flex items-center justify-center font-bold">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#00F5D4] tracking-tight">
            {todayPaid.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#859B9E] flex items-center justify-between">
            <span>Bar: {barSum.toFixed(0)} €</span>
            <span>Karte: {cardSum.toFixed(0)} €</span>
            <span>Überw.: {transferSum.toFixed(0)} €</span>
          </div>
        </div>

        {/* Zahlung offen */}
        <div className="bg-[#0B1416] border border-[#FFD600]/35 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#FFD600] transition">
          <div className="flex items-center justify-between text-[#859B9E] text-xs font-mono uppercase mb-2">
            <span>Zahlung noch offen</span>
            <span className="w-7 h-7 rounded-lg bg-[#FFD600]/20 text-[#FFD600] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#FFD600] tracking-tight">
            {unpaidTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#859B9E] flex items-center justify-between">
            <span>{unpaidOrders.length} offene Rechnungen</span>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-[#00F5D4] hover:underline cursor-pointer"
            >
              Anzeigen →
            </button>
          </div>
        </div>
      </div>

      {/* 7-Days Revenue & Trend Chart */}
      <WeeklyRevenueChart orders={orders} />

      {/* Bottom Grid: Open Orders & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Open Orders */}
        <div className="lg:col-span-7 bg-[#0B1416] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF8D4D]/20 text-[#FF8D4D] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-white">
                    Offene Werkstatt-Aufträge
                  </h3>
                  <span className="text-[11px] font-mono text-[#859B9E]">
                    {openOrders.length} Geräte aktuell im Werkstattprozess
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-mono font-bold text-[#00F5D4] hover:text-[#00F5D4]/80 flex items-center gap-1 cursor-pointer"
              >
                <span>Alle öffnen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stages */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="bg-[#040809] border border-[#FFD600]/30 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono text-[#FFD600] font-bold uppercase block">
                  1. Neu eingegangen
                </span>
                <span className="text-xl font-mono font-black text-white mt-1 block">
                  {stageEingang.length}
                </span>
              </div>
              <div className="bg-[#040809] border border-[#FF8D4D]/30 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono text-[#FF8D4D] font-bold uppercase block">
                  2. Auf Werkbank
                </span>
                <span className="text-xl font-mono font-black text-white mt-1 block">
                  {stageArbeit.length}
                </span>
              </div>
              <div className="bg-[#040809] border border-[#00F5D4]/30 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono text-[#00F5D4] font-bold uppercase block">
                  3. Testbereit
                </span>
                <span className="text-xl font-mono font-black text-white mt-1 block">
                  {stageTest.length}
                </span>
              </div>
            </div>

            {/* Orders List */}
            {openOrders.length === 0 ? (
              <div className="p-8 text-center bg-[#040809] border border-dashed border-white/10 rounded-xl text-gray-500 font-mono text-xs">
                <CheckCircle className="w-8 h-8 text-[#00E676] mx-auto mb-2 opacity-80" />
                <p className="text-white font-bold mb-1">Alle Aufträge erledigt!</p>
                <p>Aktuell befinden sich keine offenen Geräte in der Werkstatt.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {openOrders.slice(0, 6).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onNavigateTab('orders')}
                    className="p-3 rounded-xl bg-[#040809] border border-white/5 hover:border-[#00F5D4]/50 transition cursor-pointer flex items-center justify-between gap-3 text-xs font-mono group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[#00F5D4]">{order.id}</span>
                        <span className="text-[#859B9E]">• {order.date}</span>
                        {order.express && order.express > 0 ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            ⚡ EXPRESS
                          </span>
                        ) : null}
                      </div>
                      <div className="text-white font-bold truncate">{order.cust}</div>
                      <div className="text-[#859B9E] truncate text-[11px]">{order.device}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-white mb-1">
                        {order.brutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'Fertig / Test'
                            ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30'
                            : order.status === 'In Arbeit'
                            ? 'bg-[#C9743F]/20 text-[#FF8D4D] border border-[#C9743F]/30'
                            : 'bg-[#FFD600]/15 text-[#FFD600] border border-[#FFD600]/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#859B9E]">
            <span>
              {openOrders.length > 6 ? `+ ${openOrders.length - 6} weitere offene Aufträge` : 'Alle offenen Aufträge gelistet'}
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-[#00F5D4] hover:underline cursor-pointer"
            >
              Auftragsbuch verwalten →
            </button>
          </div>
        </div>

        {/* Right: Inventory & Low Stock */}
        <div className="lg:col-span-5 bg-[#0B1416] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/20 text-[#00F5D4] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-white">
                    Lagerbestand &amp; Komponenten
                  </h3>
                  <span className="text-[11px] font-mono text-[#859B9E]">
                    {inventory.length} Artikel ({totalQty} Stück gesamt)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-mono font-bold text-[#00F5D4] hover:text-[#00F5D4]/80 flex items-center gap-1 cursor-pointer"
              >
                <span>Lager öffnen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-[#040809] border border-white/10 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-[#859B9E] block mb-0.5">
                  Gebundenes Kapital (EK):
                </span>
                <span className="text-lg font-mono font-black text-white">
                  {totalStockEK.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
              <div
                className={`p-3 bg-[#040809] border rounded-xl ${
                  lowStockItems.length > 0 ? 'border-red-500/50 bg-red-950/20' : 'border-white/10'
                }`}
              >
                <span className="text-[10px] font-mono uppercase text-[#859B9E] block mb-0.5">
                  Kritische Nachbestellung:
                </span>
                <span
                  className={`text-lg font-mono font-black flex items-center gap-1.5 ${
                    lowStockItems.length > 0 ? 'text-[#FF5252]' : 'text-[#00E676]'
                  }`}
                >
                  {lowStockItems.length > 0 && <AlertTriangle className="w-4 h-4" />}
                  <span>{lowStockItems.length} Artikel</span>
                </span>
              </div>
            </div>

            {/* Category Bars */}
            <div className="space-y-3.5 mb-5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#859B9E] uppercase font-bold">
                <span>Bestand nach Kategorie</span>
                <span>Stückzahl</span>
              </div>
              {categories.map((cat, idx) => {
                const pct = Math.min(100, Math.round((cat.qty / maxQty) * 100));
                const colors = [
                  'from-[#00F5D4] to-[#00C4AA]',
                  'from-[#FF8D4D] to-[#C9743F]',
                  'from-[#00E676] to-[#00B050]',
                  'from-[#7C4DFF] to-[#651FFF]',
                  'from-[#FFD600] to-[#FFAB00]',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold truncate max-w-[180px]">{cat.name}</span>
                      <span className="text-[#859B9E]">
                        <strong className="text-white">{cat.qty}</strong> Stk. ({cat.value.toFixed(0)} € EK)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#040809] border border-white/10 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {lowStockItems.length > 0 && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Nachbestellung dringend erforderlich:</span>
                </div>
                <div className="text-[#859B9E] text-[11px] truncate">
                  {lowStockItems.map((i) => `${i.name} (${i.qty} Stk)`).join(' • ')}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#859B9E]">
            <span>Lagerverwaltung &amp; Einkauf</span>
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="text-[#00F5D4] hover:underline cursor-pointer"
            >
              Ersatzteile verwalten →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
