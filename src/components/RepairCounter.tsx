import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { useI18n } from '../i18n';
import { fetchRepairedCount } from '../services/publicStats';

// Erst ab dieser Zahl anzeigen – eine sehr kleine Zahl wirkt eher abschreckend
const MIN_TO_SHOW = 20;

/** „1.234 Geräte gerettet“ – echte abgeschlossene Aufträge aus dem Werkstatt-Manager */
export const RepairCounter: React.FC = () => {
  const { t, locale } = useI18n();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetchRepairedCount().then((n) => alive && setCount(n));
    return () => {
      alive = false;
    };
  }, []);

  if (count === null || count < MIN_TO_SHOW) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FFD2B3] px-3 py-1.5 rounded-full border border-[#FF8D4D]/30 bg-[#FF8D4D]/10 animate-fade-in">
      <Wrench className="w-3.5 h-3.5 text-[#FF8D4D]" />
      {t('{count} Geräte gerettet', { count: new Intl.NumberFormat(locale).format(count) })}
    </span>
  );
};
