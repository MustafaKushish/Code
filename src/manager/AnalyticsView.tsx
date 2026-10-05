import React, { useState } from 'react';
import { TrendingUp, Sparkles, Award, PieChart } from 'lucide-react';
import { Order } from './types';

interface AnalyticsViewProps {
  orders: Order[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orders }) => {
  const [filterPeriod, setFilterPeriod] = useState<string>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

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

  let sumBrutto = 0;
  let sumNetto = 0;
  let sumPartEK = 0;
  let sumProfit = 0;
  const deviceStats: Record<string, { count: number; revenue: number }> = {};

  filteredOrders.forEach((o) => {
    sumBrutto += o.brutto;
    sumNetto += o.netto;
    sumPartEK += o.partEK || 0;
    sumProfit += o.profit;

    const dev = (o.device || '').toLowerCase();
    let group = 'Sonstige Elektronik';

    if (
      dev.includes('ps5') ||
      dev.includes('playstation') ||
      dev.includes('xbox') ||
      dev.includes('switch') ||
      dev.includes('konsole') ||
      dev.includes('controller')
    ) {
      group = 'Gaming-Konsolen & Controller';
    } else if (dev.includes('schlüssel') || dev.includes('schluessel') || dev.includes('funk')) {
      group = 'Autoschlüssel & Funksender';
    } else if (
      dev.includes('laptop') ||
      dev.includes('macbook') ||
      dev.includes('pc') ||
      dev.includes('notebook') ||
      dev.includes('board')
    ) {
      group = 'Laptop, MacBook & Logicboards';
    } else if (
      dev.includes('phone') ||
      dev.includes('handy') ||
      dev.includes('smartphone') ||
      dev.includes('display')
    ) {
      group = 'Smartphones & Tablets';
    } else if (dev.includes('datenrettung')) {
      group = 'Chip-Level Datenrettung';
    }

    if (!deviceStats[group]) {
      deviceStats[group] = { count: 0, revenue: 0 };
    }
    deviceStats[group].count += 1;
    deviceStats[group].revenue += o.brutto;
  });

  const orderCount = filteredOrders.length;
  const avgTicket = orderCount > 0 ? sumBrutto / orderCount : 0;
  const profitMarginPercent = sumNetto > 0 ? (sumProfit / sumNetto) * 100 : 0;
  const partCostPercent = sumNetto > 0 ? (sumPartEK / sumNetto) * 100 : 0;

  const projectedMonthRevenue = sumBrutto * 1.08;
  const projectedMonthProfit = sumProfit * 1.08;

  const tips: string[] = [];
  if (partCostPercent > 25) {
    tips.push(
      `<strong>Materialkosten optimieren:</strong> Deine Materialquote liegt bei ${partCostPercent.toFixed(1)} %. Bei reinem Mikrolöten und SMD-Reparatur sollte sie unter 20 % gehalten werden.`
    );
  } else if (orderCount > 0) {
    tips.push(
      `<strong>Sehr starke Materialquote:</strong> Nur ${partCostPercent.toFixed(1)} % fließen in Ersatzteile. Deine Wertschöpfung entsteht primär durch deine präzise Handarbeit.`
    );
  }

  if (avgTicket < 75 && orderCount > 0) {
    tips.push(
      `<strong>Zusatzverkäufe nutzen:</strong> Biete jedem PS5-Kunden mit HDMI-Schaden standardmäßig die Flüssigmetall-Erneuerung (+35 €) oder eine prophylaktische Reinigung an.`
    );
  } else if (orderCount > 0) {
    tips.push(
      `<strong>Solider Ticket-Durchschnitt:</strong> Mit durchschnittlich ${avgTicket.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € pro Auftrag schöpfst du das Marktpotenzial sehr gut aus.`
    );
  }

  if (profitMarginPercent >= 65 && orderCount > 0) {
    tips.push(
      `<strong>Hervorragender Deckungsbeitrag:</strong> ${profitMarginPercent.toFixed(1)} % Gewinnmarge deckt Arbeitsaufwand, Vorhaltezeit und Diagnoserisiko exzellent ab.`
    );
  }

  if (tips.length === 0) {
    tips.push('Alle kaufmännischen Kennzahlen liegen in einem wirtschaftlich exzellenten Bereich.');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#0B1416] border border-[#C9743F]/25 rounded-2xl p-5 sm:p-7 shadow-xl shadow-black/50">
        {/* Header with Period Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="font-mono text-base sm:text-lg font-bold text-[#00F5D4] tracking-wide flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00F5D4]" />
              <span>WERKSTATT-COCKPIT &amp; WIRTSCHAFTLICHE ANALYSE</span>
            </h2>
            <p className="text-xs text-[#859B9E] font-mono mt-0.5">
              Live-Auswertung von Umsatz, Deckungsbeitrag und Gerätestatistiken
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
              className="bg-[#040809] border border-[#C9743F]/50 text-white rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#00F5D4]"
            >
              <option value="THIS_MONTH">Dieser Monat</option>
              <option value="LAST_MONTH">Letzter Monat</option>
              <option value="THIS_YEAR">Aktuelles Kalenderjahr</option>
              <option value="LAST_YEAR">Vorjahr</option>
              <option value="ALL">Gesamte Historie</option>
            </select>

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
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#040809] border border-[#C9743F] rounded-xl p-4 relative overflow-hidden">
            <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Gesamtumsatz (Brutto)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF8D4D]">
              {sumBrutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
            <div className="text-xs font-mono text-[#859B9E] mt-1.5">
              Netto: {sumNetto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
          </div>

          <div className="bg-[#040809] border border-[#00E676] rounded-xl p-4 relative overflow-hidden">
            <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Echter Werkstattgewinn
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#00E676]">
              +{sumProfit.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
            <div className="text-xs font-mono text-[#00F5D4] mt-1.5">
              Gewinnmarge: {profitMarginPercent.toFixed(1)} %
            </div>
          </div>

          <div className="bg-[#040809] border border-[#FF5252] rounded-xl p-4 relative overflow-hidden">
            <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Materialeinkauf (Teile-EK)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF5252]">
              {sumPartEK.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
            <div className="text-xs font-mono text-[#859B9E] mt-1.5">
              Materialquote: {partCostPercent.toFixed(1)} % vom Netto
            </div>
          </div>

          <div className="bg-[#040809] border border-[#00F5D4] rounded-xl p-4 relative overflow-hidden">
            <div className="text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Reparatur-Volumen
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {orderCount}
            </div>
            <div className="text-xs font-mono text-[#00F5D4] mt-1.5">
              Ø Bon: {avgTicket.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Auftrag
            </div>
          </div>
        </div>

        {/* Forecast Banner */}
        <div className="bg-[#061416] border-l-4 border-[#00F5D4] rounded-xl p-5 mb-5 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-[#00F5D4] mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Trend-Vorschau &amp; Prognose für den nächsten Monat</span>
          </div>
          <div className="text-xs sm:text-sm leading-relaxed text-[#E2ECEB] font-sans">
            {orderCount === 0 ? (
              'Für den gewählten Zeitraum liegen noch keine Buchungen vor.'
            ) : (
              <>
                Bei gleichbleibender Auftragslage liegt dein{' '}
                <strong>
                  hochgerechneter Monatsumsatz bei ca.{' '}
                  {projectedMonthRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </strong>{' '}
                (entspricht etwa{' '}
                <strong>
                  +{projectedMonthProfit.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € Reingewinn
                </strong>
                ).
                <br />
                Mit deinem aktuellen Schnitt von{' '}
                <strong>
                  {avgTicket.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € pro Kunde
                </strong>{' '}
                benötigst du ca.{' '}
                <strong>{Math.ceil(2500 / (avgTicket || 80))} Reparaturen im Monat</strong> für
                2.500 € stabilen Netto-Reingewinn.
              </>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#050E10] border-l-4 border-[#FF8D4D] rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold font-mono text-[#FF8D4D] mb-3">
            <Award className="w-4 h-4" />
            <span>Was kannst du verbessern? (Automatische Werkstatt-Analyse)</span>
          </div>
          <ul className="text-xs sm:text-sm text-gray-200 space-y-2 list-disc pl-5 font-sans leading-relaxed">
            {tips.map((t, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: t }} />
            ))}
          </ul>
        </div>

        {/* Breakdown by device group */}
        <div>
          <h4 className="font-mono text-xs sm:text-sm font-bold text-[#00F5D4] uppercase tracking-wider mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span>Auftragsverteilung nach Geräten &amp; Fehlerarten</span>
          </h4>
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left font-mono text-xs border-collapse min-w-[550px]">
              <thead className="bg-[#050A0C] text-[#00F5D4] border-b border-white/10">
                <tr>
                  <th className="p-3">Gerätegruppe / Fehler</th>
                  <th className="p-3">Anzahl Reparaturen</th>
                  <th className="p-3">Umsatz gesamt</th>
                  <th className="p-3">Ø Erlös pro Gerät</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.keys(deviceStats).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#859B9E]">
                      Keine Reparaturen im gewählten Zeitraum.
                    </td>
                  </tr>
                ) : (
                  Object.keys(deviceStats).map((k) => {
                    const s = deviceStats[k];
                    const avg = s.count > 0 ? s.revenue / s.count : 0;
                    return (
                      <tr key={k} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-bold text-white">{k}</td>
                        <td className="p-3 text-gray-300">{s.count} Reparaturen</td>
                        <td className="p-3 text-[#FF8D4D] font-bold">
                          {s.revenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </td>
                        <td className="p-3 text-[#00F5D4]">
                          {avg.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
