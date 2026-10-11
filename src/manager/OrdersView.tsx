import React, { useState } from 'react';
import {
  Search,
  X,
  Building2,
  Trash2,
  Printer,
  FileText,
  MessageCircle,
  Tag,
  Camera,
  PenTool,
  ArrowRight,
  Scan,
} from 'lucide-react';
import { Order, User, AdminAuthRequest } from './types';
import { QrCodeScannerModal } from './QrCodeScannerModal';
import { UNIFIED_STEPS, getStepNumber, getStepLabel, getWhatsAppPickupUrl } from '../utils/orderStatus';

interface OrdersViewProps {
  orders: Order[];
  currentUser: User | null;
  onChangeStatus: (id: string, status: string) => void;
  onTogglePaid: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onPrintInvoice: (order: Order) => void;
  onPrintKva: (order: Order) => void;
  onRequestAdminAuth: (request: AdminAuthRequest) => void;
  onOpenWhatsApp: (order: Order) => void;
  onOpenLabel: (order: Order) => void;
  onOpenPhotos: (order: Order) => void;
  onOpenSignature: (order: Order) => void;
}

function highlightMatch(text: string, query: string) {
  if (!query || !query.trim() || !text) return text;
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);

  return (
    <>
      {before}
      <mark className="bg-[#00F5D4]/25 text-[#00F5D4] font-bold px-0.5 rounded">
        {match}
      </mark>
      {after}
    </>
  );
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUser,
  onChangeStatus,
  onTogglePaid,
  onDeleteOrder,
  onPrintInvoice,
  onPrintKva,
  onRequestAdminAuth,
  onOpenWhatsApp,
  onOpenLabel,
  onOpenPhotos,
  onOpenSignature,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleTogglePaidWithAuth = (order: Order) => {
    if (
      currentUser?.role === 'admin' ||
      currentUser?.role === 'buchhaltung' ||
      currentUser?.canSettleInvoices === true
    ) {
      onTogglePaid(order.id);
    } else {
      onRequestAdminAuth({
        type: 'SETTLE_INVOICE',
        title: 'Rechnungsbegleichung freigeben',
        description:
          'Mitarbeiter ohne Buchhaltungs-Berechtigung dürfen Zahlungen nicht selbst verbuchen. Zur Freigabe ist der PIN der Buchhaltung oder des Administrators erforderlich.',
        itemDetails: `Rechnung: ${order.id} | Kunde: ${order.cust} | Betrag: ${order.brutto.toFixed(2)} €`,
        requiredRole: 'buchhaltung_or_admin',
        onConfirm: () => onTogglePaid(order.id),
      });
    }
  };

  const handleDeleteWithAuth = (order: Order) => {
    if (currentUser?.role === 'admin' || currentUser?.canDelete === true) {
      setOrderToDelete(order);
    } else {
      onRequestAdminAuth({
        type: 'DELETE_ORDER',
        title: 'Auftrag / Rechnung löschen',
        description:
          'Mitarbeiter dürfen Aufträge und Rechnungen nicht ohne Bestätigung löschen. Zur Freigabe dieser Löschung ist das Passwort/PIN des Administrators erforderlich.',
        itemDetails: `Auftrag: ${order.id} | Kunde: ${order.cust} | Betrag: ${order.brutto.toFixed(2)} €`,
        requiredRole: 'admin',
        onConfirm: () => onDeleteOrder(order.id),
      });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      o.cust.toLowerCase().includes(q) ||
      o.device.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      (o.serial && o.serial.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'ALL' ||
      o.status === statusFilter ||
      getStepNumber(o.status).toString() === statusFilter ||
      getStepLabel(getStepNumber(o.status)) === statusFilter;
    const matchesCustomer =
      customerFilter === 'ALL' ||
      (customerFilter === 'B2B' && o.isB2B) ||
      (customerFilter === 'B2C' && !o.isB2B);

    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const sumBrutto = filteredOrders.reduce((acc, o) => acc + o.brutto, 0);
  const sumProfit = filteredOrders.reduce((acc, o) => acc + o.profit, 0);

  const fmtEuro = (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€';

  const renderStatus = (order: Order) => {
    const stepNum = getStepNumber(order.status);
    const currentLabel = getStepLabel(stepNum);
    return (
      <div className="flex flex-col items-start gap-1">
        <select
          value={currentLabel}
          onChange={(e) => onChangeStatus(order.id, e.target.value)}
          className={`text-xs font-mono rounded px-2.5 py-1.5 outline-none border cursor-pointer font-bold ${
            stepNum === 5
              ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/50'
              : stepNum === 4
              ? 'bg-[#00F5D4]/15 text-[#00F5D4] border-[#00F5D4]/50'
              : stepNum === 3
              ? 'bg-[#FF8D4D]/15 text-[#FF8D4D] border-[#FF8D4D]/50'
              : stepNum === 2
              ? 'bg-blue-400/15 text-blue-300 border-blue-400/50'
              : 'bg-amber-400/15 text-amber-300 border-amber-400/50'
          }`}
        >
          {UNIFIED_STEPS.map((st) => (
            <option key={st.step} value={st.label} className="bg-[#0B1416] text-white">
              {st.label}
            </option>
          ))}
        </select>

        {stepNum === 5 && (
          <a
            href={getWhatsAppPickupUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#00E676] text-[#060B0C] hover:bg-white transition-all shadow-[0_0_12px_rgba(0,230,118,0.4)] animate-pulse"
            title="Kunden per WhatsApp über fertige Abholung informieren"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Abholbereit senden</span>
          </a>
        )}
      </div>
    );
  };

  const renderPaid = (order: Order) => (
    <button
      type="button"
      onClick={() => handleTogglePaidWithAuth(order)}
      className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer border transition ${
        order.paid === 'Bezahlt'
          ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40 hover:bg-[#00E676]/25'
          : 'bg-[#FFD600]/15 text-[#FFD600] border-[#FFD600]/40 hover:bg-[#FFD600]/25'
      }`}
      title={
        currentUser?.role === 'admin' ||
        currentUser?.role === 'buchhaltung' ||
        currentUser?.canSettleInvoices
          ? 'Zahlungsstatus umschalten'
          : 'Freigabe durch Buchhaltung/Admin erforderlich'
      }
    >
      {order.paid}
    </button>
  );

  const renderActions = (order: Order, align: string) => (
    <div className={`flex flex-wrap items-center ${align} gap-1.5`}>
      <button
        type="button"
        onClick={() => onOpenWhatsApp(order)}
        className="inline-flex items-center gap-1 px-2.5 py-2 md:px-2 md:py-1 rounded text-[11px] font-mono font-bold bg-[#00E676]/15 border border-[#00E676]/50 text-[#00E676] hover:bg-[#00E676] hover:text-black transition cursor-pointer"
        title="Kunden per WhatsApp benachrichtigen (Abholung/KVA)"
      >
        <MessageCircle className="w-3 h-3" />
        <span>WA</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenLabel(order)}
        className="inline-flex items-center gap-1 px-2.5 py-2 md:px-2 md:py-1 rounded text-[11px] font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer"
        title="Geräte-Begleitschein mit QR-Code drucken"
      >
        <Tag className="w-3 h-3" />
        <span>Etikett</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenPhotos(order)}
        className={`inline-flex items-center gap-1 px-2.5 py-2 md:px-2 md:py-1 rounded text-[11px] font-mono font-bold border transition cursor-pointer ${
          order.photos && order.photos.length > 0
            ? 'bg-[#FF8D4D]/20 border-[#FF8D4D] text-[#FF8D4D]'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
        }`}
        title="Fotodokumentation (Vorher / Nachher / Mikroskop)"
      >
        <Camera className="w-3 h-3" />
        <span>{order.photos && order.photos.length > 0 ? `${order.photos.length} 📸` : 'Foto'}</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenSignature(order)}
        className={`inline-flex items-center gap-1 px-2.5 py-2 md:px-2 md:py-1 rounded text-[11px] font-mono font-bold border transition cursor-pointer ${
          order.customerSignature
            ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
        }`}
        title="Kundenunterschrift bei Annahme"
      >
        <PenTool className="w-3 h-3" />
        <span>{order.customerSignature ? '✓ Signiert' : 'Sign'}</span>
      </button>
      <button
        type="button"
        onClick={() => onPrintInvoice(order)}
        className="inline-flex items-center gap-1 px-2.5 py-2 md:px-2 md:py-1 rounded text-[11px] font-mono font-bold bg-white/5 border border-white/15 text-gray-200 hover:text-white transition cursor-pointer"
        title="Kundenrechnung drucken"
      >
        <Printer className="w-3 h-3" />
        <span>Rechnung</span>
      </button>
      <button
        type="button"
        onClick={() => onPrintKva(order)}
        className="inline-flex items-center gap-1 px-2.5 py-2 md:px-2 md:py-1 rounded text-[11px] font-mono font-bold bg-white/5 border border-white/15 text-gray-200 hover:text-white transition cursor-pointer"
        title="Kostenvoranschlag drucken"
      >
        <FileText className="w-3 h-3" />
        <span>KVA</span>
      </button>
      <button
        type="button"
        onClick={() => handleDeleteWithAuth(order)}
        className="p-2 md:p-1 text-gray-500 hover:text-[#FF5252] transition cursor-pointer"
        title={
          currentUser?.role === 'admin'
            ? 'Auftrag löschen'
            : 'Löschen (Admin-Bestätigung erforderlich)'
        }
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center gap-2">
      <Search className="w-8 h-8 text-gray-600 mb-1" />
      <p className="text-sm font-bold text-white font-mono">
        {searchTerm.trim()
          ? `Keine Aufträge für „${searchTerm}“ gefunden.`
          : 'Keine Aufträge in dieser Filterauswahl vorhanden.'}
      </p>
      <p className="text-xs text-[#859B9E] font-mono max-w-md">
        {searchTerm.trim()
          ? 'Bitte prüfen Sie die Schreibweise der Gerätebezeichnung oder des Kundennamens.'
          : 'Legen Sie über den Kalkulator einen neuen Reparaturauftrag an.'}
      </p>
      {searchTerm.trim() && (
        <button
          type="button"
          onClick={() => setSearchTerm('')}
          className="mt-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer"
        >
          Suchfilter zurücksetzen
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#0B1416] border border-[#C9743F]/25 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/50 animate-fade-in">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search
                className={`w-4 h-4 absolute left-3.5 transition-colors pointer-events-none ${
                  searchTerm.trim() ? 'text-[#00F5D4]' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Gerätebezeichnung oder Kundenname eingeben (z. B. PS5, Müller, CODE-9231)..."
                className="w-full bg-[#040809] border border-white/15 focus:border-[#00F5D4] rounded-xl pl-10 pr-24 py-2.5 text-xs font-mono text-white placeholder-gray-500 outline-none shadow-inner transition focus:ring-1 focus:ring-[#00F5D4]/40"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Suche leeren"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                  {filteredOrders.length} / {orders.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-[#040809] border border-white/15 text-white rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-[#00F5D4] cursor-pointer"
            >
              <option value="ALL">Alle Kundentypen</option>
              <option value="B2B">Nur B2B-Partner</option>
              <option value="B2C">Nur Endkunden</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#040809] border border-white/15 text-white rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:border-[#00F5D4] cursor-pointer"
            >
              <option value="ALL">Alle 5 Status-Schritte</option>
              {UNIFIED_STEPS.map((st) => (
                <option key={st.step} value={st.label}>
                  {st.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black rounded-xl text-xs font-mono font-bold transition cursor-pointer shadow-sm shadow-[#00F5D4]/10"
              title="Geräte-Etikett oder QR-Code mit Handykamera scannen"
            >
              <Scan className="w-4 h-4" />
              <span>QR-Scan</span>
            </button>
          </div>
        </div>

        {searchTerm.trim() && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#859B9E]">Aktiver Suchfilter:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00F5D4]/15 border border-[#00F5D4]/40 text-[#00F5D4] text-[11px] font-bold">
              <span>Gerät / Kunde: „{searchTerm}“</span>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="hover:text-white cursor-pointer ml-0.5"
                title="Filter löschen"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
            <span className="text-[#859B9E] text-[11px]">
              ({filteredOrders.length} Treffer)
            </span>
          </div>
        )}
      </div>

      {/* Handy: Karten statt breiter Tabelle */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 border border-white/10 rounded-xl text-center text-[#859B9E]">{renderEmpty()}</div>
        ) : (
          filteredOrders.map((order) => (
            <article key={order.id} className="border border-white/10 rounded-xl bg-[#080E10] p-3.5 font-mono text-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-white">{highlightMatch(order.id, searchTerm)}</strong>
                    {order.isB2B && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30">
                        <Building2 className="w-3 h-3" /> B2B
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#859B9E]">
                    {order.date}
                    {order.technician ? ` · ${order.technician}` : ''}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#FF8D4D] text-sm">{fmtEuro(order.brutto)}</div>
                  <div className="text-[11px] text-[#00E676]">+{fmtEuro(order.profit)}</div>
                </div>
              </div>

              <div>
                <strong className="text-white block">{highlightMatch(order.cust, searchTerm)}</strong>
                {order.phone && (
                  <a href={`tel:${order.phone.replace(/\s+/g, '')}`} className="text-[11px] text-[#00F5D4]">
                    {order.phone}
                  </a>
                )}
                <div className="text-white/90 mt-1 break-words">{highlightMatch(order.device, searchTerm)}</div>
                {order.serial && <div className="text-[11px] text-[#859B9E]">S/N: {highlightMatch(order.serial, searchTerm)}</div>}
              </div>

              <div className="flex flex-wrap items-start gap-2">
                {renderStatus(order)}
                {renderPaid(order)}
                <span className="text-[11px] text-[#859B9E] self-center">{order.min} Min</span>
              </div>

              <div className="pt-2.5 border-t border-white/5">{renderActions(order, 'justify-start')}</div>
            </article>
          ))
        )}
      </div>

      {/* Orders Table (ab Tablet-Breite) */}
      <div className="hidden md:block overflow-x-auto border border-white/10 rounded-xl">
        <table className="w-full text-left font-mono text-xs border-collapse min-w-[980px]">
          <thead className="bg-[#050A0C] text-[#00F5D4] border-b border-white/10">
            <tr>
              <th className="p-3">Rechnungs-Nr. / Datum</th>
              <th className="p-3">Kunde &amp; Anschrift</th>
              <th className="p-3">Gerät &amp; Defekt</th>
              <th className="p-3">Status</th>
              <th className="p-3">Zahlung</th>
              <th className="p-3">Dauer</th>
              <th className="p-3">Netto</th>
              <th className="p-3">Brutto</th>
              <th className="p-3">Gewinn</th>
              <th className="p-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-10 text-center text-[#859B9E]">
                  {renderEmpty()}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3 align-middle">
                    <strong className="text-white block font-mono">
                      {highlightMatch(order.id, searchTerm)}
                    </strong>
                    <span className="text-[11px] text-[#859B9E]">{order.date}</span>
                    {order.technician && (
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                        👨‍🔧 {order.technician}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-middle">
                    {order.isB2B && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30 mr-1.5">
                        <Building2 className="w-3 h-3" /> B2B
                      </span>
                    )}
                    <strong className="text-white">
                      {highlightMatch(order.cust, searchTerm)}
                    </strong>
                    {order.address && (
                      <div
                        className="text-[11px] text-[#859B9E] truncate max-w-[200px]"
                        title={order.address}
                      >
                        {highlightMatch(order.address, searchTerm)}
                      </div>
                    )}
                    <div className="text-[11px] text-[#00F5D4]">{order.phone}</div>
                  </td>
                  <td className="p-3 align-middle">
                    <div className="text-white font-medium max-w-[220px]">
                      {highlightMatch(order.device, searchTerm)}
                    </div>
                    <div className="text-[11px] text-[#859B9E]">
                      S/N: {order.serial ? highlightMatch(order.serial, searchTerm) : '–'}
                    </div>
                  </td>
                  <td className="p-3 align-middle">
                    {renderStatus(order)}
                  </td>
                  <td className="p-3 align-middle">
                    {renderPaid(order)}
                  </td>
                  <td className="p-3 align-middle text-gray-300">{order.min} Min</td>
                  <td className="p-3 align-middle text-gray-200">
                    {order.netto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                  <td className="p-3 align-middle font-bold text-[#FF8D4D]">
                    {order.brutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                  <td className="p-3 align-middle font-bold text-[#00E676]">
                    +{order.profit.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                  <td className="p-3 align-middle text-right">
                    {renderActions(order, 'justify-end')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-end gap-6 mt-5 pt-4 border-t border-white/10 font-mono text-xs sm:text-sm">
        <div>
          Gesamt-Umsatz:{' '}
          <strong className="text-[#FF8D4D] text-base">
            {sumBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </strong>
        </div>
        <div>
          Gesamt-Reingewinn:{' '}
          <strong className="text-[#00E676] text-base">
            +{sumProfit.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </strong>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0B1416] border border-[#FF5252] rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-red-950/50 relative">
            <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/50 flex items-center justify-center text-[#FF5252] mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-mono text-base font-black text-white mb-1">
              Auftrag endgültig löschen?
            </h3>
            <p className="text-xs font-mono text-[#859B9E] mb-4">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten dieses Auftrags werden entfernt.
            </p>
            <div className="p-3 bg-[#040809] border border-white/10 rounded-xl font-mono text-xs text-white space-y-1 mb-5">
              <div>
                <strong>Auftrag:</strong> <span className="text-[#00F5D4]">{orderToDelete.id}</span>
              </div>
              <div>
                <strong>Kunde:</strong> {orderToDelete.cust}
              </div>
              <div>
                <strong>Gerät:</strong> {orderToDelete.device}
              </div>
              <div>
                <strong>Betrag:</strong> {orderToDelete.brutto.toFixed(2)} € ({orderToDelete.paid})
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-300 hover:text-white border border-white/10 transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-[#FF5252] text-white hover:bg-red-600 transition cursor-pointer shadow-lg shadow-red-500/20"
              >
                Ja, Auftrag löschen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* QR Code Scanner Modal */}
      <QrCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          const match = code.match(/(RE|KVA)-\d{4}-\d+/i);
          if (match) {
            setSearchTerm(match[0].toUpperCase());
          } else {
            setSearchTerm(code.trim());
          }
        }}
      />
    </div>
  );
};
