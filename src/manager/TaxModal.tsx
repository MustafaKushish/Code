import React, { useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Order, TaxReportPayload } from './types';

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onPrintReport: (payload: TaxReportPayload) => void;
}

export const TaxModal: React.FC<TaxModalProps> = ({
  isOpen,
  onClose,
  orders,
  onPrintReport,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<string>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!isOpen) return null;

  const parseGermanDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return null;
  };

  const filteredOrders = orders.filter((o) => {
    if (customStart || customEnd) {
      const s = customStart ? new Date(customStart + 'T00:00:00') : null;
      const e = customEnd ? new Date(customEnd + 'T23:59:59') : null;
      const d = parseGermanDate(o.date);
      if (!d) return true;
      if (s && d < s) return false;
      if (e && d > e) return false;
      return true;
    }

    if (filterPeriod === 'ALL') return true;

    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth();
    const d = parseGermanDate(o.date);
    if (!d) return true;

    const oYear = d.getFullYear();
    const oMonth = d.getMonth();

    if (filterPeriod === 'THIS_MONTH') {
      return oYear === currYear && oMonth === currMonth;
    }
    if (filterPeriod === 'LAST_MONTH') {
      const prevMonth = currMonth === 0 ? 11 : currMonth - 1;
      const prevYear = currMonth === 0 ? currYear - 1 : currYear;
      return oYear === prevYear && oMonth === prevMonth;
    }
    if (filterPeriod === 'THIS_YEAR') {
      return oYear === currYear;
    }
    if (filterPeriod === 'LAST_YEAR') {
      return oYear === currYear - 1;
    }
    return true;
  });

  let grossTotal = 0;
  let net19Total = 0;
  let vat19Total = 0;
  let net0Total = 0;
  let partEKTotal = 0;
  let profitTotal = 0;

  filteredOrders.forEach((o) => {
    grossTotal += o.brutto;
    const taxRate = o.taxRate === undefined ? 19 : o.taxRate;
    const taxVal = o.taxAmount === undefined ? (taxRate === 19 ? o.netto * 0.19 : 0) : o.taxAmount;
    const partCost = o.partEK || 0;

    if (taxRate === 19) {
      net19Total += o.netto;
      vat19Total += taxVal;
    } else {
      net0Total += o.netto;
    }

    partEKTotal += partCost;
    profitTotal += o.profit;
  });

  const getPeriodLabel = (): string => {
    if (customStart || customEnd) {
      const fmt = (d: string) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('de-DE') : '…');
      return `Benutzerdefiniert: ${fmt(customStart)} – ${fmt(customEnd)}`;
    }
    switch (filterPeriod) {
      case 'THIS_MONTH':
        return 'Dieser Monat';
      case 'LAST_MONTH':
        return 'Letzter Monat';
      case 'THIS_YEAR':
        return 'Aktuelles Kalenderjahr';
      case 'LAST_YEAR':
        return 'Vorjahr';
      default:
        return 'Gesamte Historie';
    }
  };

  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert('Keine Belege im gewählten Zeitraum vorhanden.');
      return;
    }

    let csv =
      'Belegnummer;Belegdatum;Kunde;Leistung_Geraet;Zahlart;Zahlstatus;DATEV_Konto_SKR03;USt_Satz;Umsatz_Netto_EUR;USt_Betrag_EUR;Umsatz_Brutto_EUR;Material_EK_EUR;Rohertrag_EUR\n';

    filteredOrders.forEach((o) => {
      const tRate = o.taxRate === undefined ? 19 : o.taxRate;
      const tVal = o.taxAmount === undefined ? (tRate === 19 ? o.netto * 0.19 : 0) : o.taxAmount;
      const pEK = o.partEK || 0;
      const payMeth = o.payMethod || 'Bar';
      const paidStat = o.paid || 'Offen';
      const skr03Konto = tRate === 19 ? '8400 (Erlöse 19% USt)' : '8100 (Steuerfreie Erlöse)';
      csv += `"${o.id}";"${o.date}";"${o.cust.replace(/"/g, '""')}";"${o.device.replace(/"/g, '""')}";"${payMeth}";"${paidStat}";"${skr03Konto}";"${tRate}%";"${o.netto.toFixed(2)}";"${tVal.toFixed(2)}";"${o.brutto.toFixed(2)}";"${pEK.toFixed(2)}";"${o.profit.toFixed(2)}"\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CODE_Steuerberater_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (filteredOrders.length === 0) {
      alert('Keine Belege im gewählten Zeitraum vorhanden.');
      return;
    }
    onPrintReport({
      periodLabel: getPeriodLabel(),
      printDate: new Date().toLocaleDateString('de-DE'),
      grossTotal,
      net19Total,
      vat19Total,
      net0Total,
      partEKTotal,
      profitTotal,
      items: filteredOrders,
    });
  };

  const handleExportHtmlReport = () => {
    if (filteredOrders.length === 0) {
      alert('Keine Belege im gewählten Zeitraum vorhanden.');
      return;
    }
    const period = getPeriodLabel();
    const printDate = new Date().toLocaleDateString('de-DE');
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Steuerbericht - ${period}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 30px; color: #0f172a; font-size: 12px; }
    h1 { margin: 0; font-size: 22px; color: #0f172a; font-weight: 900; }
    .header { display: flex; justify-content: space-between; border-bottom: 2.5px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
    .kpi { display: flex; gap: 12px; margin-bottom: 24px; }
    .kpi-box { border: 1.5px solid #cbd5e1; background: #f8fafc; padding: 12px; border-radius: 8px; flex: 1; text-align: center; }
    .kpi-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px; }
    .kpi-val { font-size: 16px; font-weight: 900; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; border-bottom: 2px solid #0f172a; font-weight: 800; font-size: 10px; text-transform: uppercase; }
    td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
    .num { text-align: right; }
    @media print {
      body { margin: 10mm; }
      @page { margin: 10mm; size: auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CODE <span style="color: #c25e1a;">// WERKSTATT</span></h1>
      <div style="color: #475569; font-size: 11px; margin-top: 2px; font-weight: 600;">Steuer- &amp; Buchhaltungsbericht (DATEV EÜR Vorbereitung)</div>
      <div style="color: #64748b; font-size: 11px;">Inh. Mustafa Al-Zurgany • 92318 Neumarkt in der Oberpfalz • Tel: 0176 4174 4443</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${period}</div>
      <div style="color: #64748b; font-size: 10.5px; margin-top: 3px;">Druckdatum: ${printDate}</div>
    </div>
  </div>

  <div class="kpi">
    <div class="kpi-box"><div class="kpi-title">Brutto-Erlöse</div><div class="kpi-val" style="color: #c25e1a;">${grossTotal.toFixed(2)} €</div></div>
    <div class="kpi-box"><div class="kpi-title">Netto (19% USt)</div><div class="kpi-val">${net19Total.toFixed(2)} €</div></div>
    <div class="kpi-box"><div class="kpi-title">USt 19% (Zahllast)</div><div class="kpi-val" style="color: #059669;">${vat19Total.toFixed(2)} €</div></div>
    <div class="kpi-box"><div class="kpi-title">Material (Teile-EK)</div><div class="kpi-val" style="color: #dc2626;">${partEKTotal.toFixed(2)} €</div></div>
    <div class="kpi-box"><div class="kpi-title">Rohertrag</div><div class="kpi-val" style="color: #16a34a;">+${profitTotal.toFixed(2)} €</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Beleg-Nr.</th>
        <th>Datum</th>
        <th>Kunde</th>
        <th>Leistung / Gerät</th>
        <th class="num">Netto</th>
        <th class="num">USt 19%</th>
        <th class="num">Brutto</th>
        <th class="num">Teile-EK</th>
      </tr>
    </thead>
    <tbody>
      ${filteredOrders
        .map(
          (o) => `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>${o.date}</td>
          <td>${o.cust}</td>
          <td>${o.device}</td>
          <td class="num">${o.netto.toFixed(2)} €</td>
          <td class="num">${(o.taxAmount || 0).toFixed(2)} €</td>
          <td class="num" style="font-weight: bold; color: #c25e1a;">${o.brutto.toFixed(2)} €</td>
          <td class="num" style="color: #dc2626;">${(o.partEK || 0).toFixed(2)} €</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 200);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CODE_Steuerbericht_${period.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#0B1416] border-[1.5px] border-[#00F5D4] rounded-2xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#00F5D4] p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
          <div>
            <h3 className="font-mono text-lg sm:text-xl font-black text-[#00F5D4] tracking-wide flex items-center gap-2">
              <span>📑 STEUERBERATER- &amp; FINANZAMTSBERICHT</span>
            </h3>
            <p className="text-xs text-[#859B9E] font-mono mt-1">
              EÜR- und UStVA-Vorbereitung für das Steuerbüro (Regelbesteuerung / § 19 UStG)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                setCustomStart('');
                setCustomEnd('');
              }}
              className="bg-[#040809] border border-[#C9743F]/50 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:border-[#00F5D4] outline-none"
            >
              <option value="THIS_MONTH">Dieser Monat</option>
              <option value="LAST_MONTH">Letzter Monat</option>
              <option value="THIS_YEAR">Aktuelles Kalenderjahr</option>
              <option value="LAST_YEAR">Vorjahr</option>
              <option value="ALL">Gesamte Historie</option>
            </select>

            <span className="text-xs text-gray-400 font-mono hidden sm:inline">oder:</span>

            <div className="flex items-center gap-1">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-[#040809] border border-[#C9743F]/50 text-white rounded-lg px-2 py-1 text-xs font-mono outline-none"
              />
              <span className="text-gray-400 text-xs">–</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-[#040809] border border-[#C9743F]/50 text-white rounded-lg px-2 py-1 text-xs font-mono outline-none"
              />
              {(customStart || customEnd) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStart('');
                    setCustomEnd('');
                  }}
                  className="px-2 py-1 text-xs font-mono text-gray-400 hover:text-white bg-white/5 rounded cursor-pointer"
                  title="Datumsfilter leeren"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#C9743F] text-white hover:bg-[#FF8D4D] transition cursor-pointer shadow-md"
              title="Steuerbericht direkt drucken"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drucken</span>
            </button>

            <button
              type="button"
              onClick={handleExportHtmlReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              title="Druckfertige HTML-Berichtsseite herunterladen / öffnen"
            >
              <span>Druck-HTML</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-sm"
              title="DATEV- und Excel-kompatible CSV-Datei exportieren"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DATEV-CSV</span>
            </button>
          </div>
        </div>

        {/* 5 Indicator Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center">
            <span className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Brutto-Erlöse
            </span>
            <strong className="text-lg font-mono text-[#FF8D4D]">
              {grossTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </strong>
          </div>

          <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center">
            <span className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Netto (19% USt)
            </span>
            <strong className="text-lg font-mono text-white">
              {net19Total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </strong>
          </div>

          <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center">
            <span className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              USt 19% (Zahllast)
            </span>
            <strong className="text-lg font-mono text-[#00F5D4]">
              {vat19Total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </strong>
          </div>

          <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center">
            <span className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Material (Teile-EK)
            </span>
            <strong className="text-lg font-mono text-[#FF5252]">
              {partEKTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </strong>
          </div>

          <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Steuerl. Rohertrag
            </span>
            <strong className="text-lg font-mono text-[#00E676]">
              +{profitTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </strong>
          </div>
        </div>

        {/* Orders Table for DATEV */}
        <div className="overflow-x-auto max-h-72 border border-white/10 rounded-xl">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[650px]">
            <thead className="bg-[#050A0C] text-[#00F5D4] border-b border-white/10 sticky top-0">
              <tr>
                <th className="p-2.5">Beleg-Nr.</th>
                <th className="p-2.5">Datum</th>
                <th className="p-2.5">Kunde</th>
                <th className="p-2.5">USt</th>
                <th className="p-2.5 text-right">Netto</th>
                <th className="p-2.5 text-right">USt-Betrag</th>
                <th className="p-2.5 text-right">Brutto</th>
                <th className="p-2.5 text-right">Teile-EK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-[#859B9E]">
                    Keine Aufträge im gewählten Zeitraum vorhanden.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-bold text-white">{o.id}</td>
                    <td className="p-2.5 text-gray-400">{o.date}</td>
                    <td className="p-2.5 text-white">{o.cust}</td>
                    <td className="p-2.5">{o.taxRate}%</td>
                    <td className="p-2.5 text-right">
                      {o.netto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td className="p-2.5 text-right text-[#00F5D4]">
                      {o.taxAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td className="p-2.5 text-right font-bold text-[#FF8D4D]">
                      {o.brutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td className="p-2.5 text-right text-[#FF5252]">
                      {(o.partEK || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
