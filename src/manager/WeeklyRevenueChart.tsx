import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { Order } from './types';

interface WeeklyRevenueChartProps {
  orders: Order[];
}

function parseDateToIso(dateStr?: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr.includes('-') ? dateStr.slice(0, 10) : '';
}

export const WeeklyRevenueChart: React.FC<WeeklyRevenueChartProps> = ({ orders }) => {
  const [metric, setMetric] = useState<'brutto' | 'profit'>('brutto');
  const [hoveredDay, setHoveredDay] = useState<any | null>(null);

  const data = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoKey = `${yyyy}-${mm}-${dd}`;
      const dayLabel = d.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
      const shortDate = `${dd}.${mm}.`;
      const isToday = i === 0;

      const matched = orders.filter((o) => {
        const orderDate = parseDateToIso(o.date);
        const orderIso = o.isoDate ? o.isoDate.slice(0, 10) : '';
        return orderDate === isoKey || orderIso === isoKey;
      });

      const brutto = matched.reduce((sum, o) => sum + (o.brutto || 0), 0);
      const netto = matched.reduce((sum, o) => sum + (o.netto || 0), 0);
      const profit = matched.reduce((sum, o) => sum + (o.profit || 0), 0);

      days.push({
        isoKey,
        dayLabel,
        shortDate,
        fullLabel: `${dayLabel}, ${shortDate}`,
        isToday,
        brutto: Math.round(brutto * 100) / 100,
        netto: Math.round(netto * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        ordersCount: matched.length,
      });
    }
    return days;
  }, [orders]);

  const total7Days = data.reduce((sum, d) => sum + d.brutto, 0);
  const avgPerDay = total7Days / 7;

  // SVG Chart Geometry
  const svgWidth = 800;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const maxVal = Math.max(...data.map((d) => (metric === 'brutto' ? d.brutto : d.profit)), 50);

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartW;
    const val = metric === 'brutto' ? d.brutto : d.profit;
    const y = paddingY + chartH - (val / maxVal) * chartH;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

  return (
    <div className="bg-[#0B1416] border border-[#00F5D4]/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-72 h-36 bg-[#00F5D4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm sm:text-base font-bold text-white">
                Tägliche Umsätze (Letzte 7 Tage)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F5D4]/15 text-[#00F5D4] font-bold">
                Live-Diagramm
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#859B9E]">
              // ENTWICKLUNG DER TAGESEINNAHMEN &amp; AUFTRAGSVOLUMINA
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#040809] border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-[#859B9E] text-[10px] block">7-Tage-Summe</span>
            <span className="text-[#00F5D4] font-black text-sm">
              {total7Days.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </span>
          </div>

          <div className="bg-[#040809] border border-white/10 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-[#859B9E] text-[10px] block">Ø / Tag</span>
            <span className="text-white font-bold text-sm">
              {avgPerDay.toFixed(0)} €
            </span>
          </div>

          <div className="flex items-center bg-[#040809] border border-white/10 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setMetric('brutto')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                metric === 'brutto'
                  ? 'bg-[#00F5D4] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Brutto
            </button>
            <button
              type="button"
              onClick={() => setMetric('profit')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                metric === 'profit'
                  ? 'bg-[#00E676] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Gewinn
            </button>
          </div>
        </div>
      </div>

      {/* SVG Responsive Area Chart */}
      <div className="w-full relative z-10 pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-48 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={metric === 'brutto' ? '#00F5D4' : '#00E676'}
                stopOpacity="0.45"
              />
              <stop
                offset="95%"
                stopColor={metric === 'brutto' ? '#00F5D4' : '#00E676'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingY + chartH * pct;
            return (
              <line
                key={`grid-${i}`}
                x1={paddingX}
                y1={y}
                x2={paddingX + chartW}
                y2={y}
                stroke="#ffffff"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={metric === 'brutto' ? '#00F5D4' : '#00E676'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const isToday = p.data.isToday;
            const isHovered = hoveredDay?.isoKey === p.data.isoKey;
            return (
              <g
                key={`pt-${p.data.isoKey}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredDay(p.data)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : isToday ? 5 : 3.5}
                  fill={isToday || isHovered ? (metric === 'brutto' ? '#00F5D4' : '#00E676') : '#0B1416'}
                  stroke={metric === 'brutto' ? '#00F5D4' : '#00E676'}
                  strokeWidth="2"
                  className="transition-all"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="18"
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div className="absolute top-16 right-4 sm:right-8 bg-[#040809] border border-[#00F5D4] p-3 rounded-xl shadow-2xl font-mono text-xs z-20 pointer-events-none animate-fade-in">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1 mb-1.5 font-bold text-white">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00F5D4]" />
                {hoveredDay.fullLabel}
              </span>
              {hoveredDay.isToday && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00F5D4]/20 text-[#00F5D4]">
                  Heute
                </span>
              )}
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-[#859B9E]">Umsatz (Brutto):</span>
                <strong className="text-white font-bold">{hoveredDay.brutto.toFixed(2)} €</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#859B9E]">Umsatz (Netto):</span>
                <span className="text-gray-300">{hoveredDay.netto.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/5 pt-1 text-[#00E676]">
                <span>Rohertrag (Gewinn):</span>
                <strong>+{hoveredDay.profit.toFixed(2)} €</strong>
              </div>
              <div className="flex justify-between gap-4 text-[#859B9E]">
                <span>Aufträge:</span>
                <span className="text-[#FF8D4D] font-bold">{hoveredDay.ordersCount} Stk.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-Days Cards Row */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-white/10 relative z-10">
        {data.map((d) => (
          <div
            key={d.isoKey}
            className={`p-1.5 sm:p-2 rounded-xl text-center font-mono transition border ${
              d.isToday
                ? 'bg-[#00F5D4]/10 border-[#00F5D4] text-[#00F5D4] shadow-md shadow-[#00F5D4]/10'
                : 'bg-[#040809] border-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <span className="text-[10px] block font-bold text-gray-300">
              {d.dayLabel} {d.isToday && '★'}
            </span>
            <span className="text-[9px] text-[#859B9E] block">{d.shortDate}</span>
            <span className={`text-xs font-black block mt-0.5 ${d.isToday ? 'text-[#00F5D4]' : 'text-white'}`}>
              {d.brutto > 0 ? `${d.brutto.toFixed(0)}€` : '0€'}
            </span>
            <span className="text-[9px] text-[#859B9E] block">
              {d.ordersCount} Auftr.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
