import React from 'react';
import { ArrowRight, Globe, LayoutDashboard, LifeBuoy, Receipt } from 'lucide-react';
import { msg, useI18n } from '../i18n';

const ITEMS = [
  { icon: Globe, label: msg('Websites') },
  { icon: LayoutDashboard, label: msg('Geschäftssysteme') },
  { icon: Receipt, label: msg('Kassensysteme') },
  { icon: LifeBuoy, label: msg('IT-Betreuung') },
];

/** Verweis von der Werkstatt-Startseite auf CODE Digital (/digital) */
export const DigitalTeaser: React.FC = () => {
  const { t } = useI18n();
  return (
    <section id="digital" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <a
          href="/digital"
          className="reveal group block relative overflow-hidden rounded-3xl border border-[#FF8D4D]/25 bg-gradient-to-br from-[#1A120D]/80 via-[#0B1315]/90 to-[#071113] p-7 sm:p-10 hover:border-[#FF8D4D]/50 transition-colors"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 items-center">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#FFB98A] px-3 py-1.5 rounded-full border border-[#FF8D4D]/30 bg-[#FF8D4D]/10 mb-4">
                {t('Neu: CODE Digital')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 text-balance">
                {t('Du hast ein Geschäft? Wir bauen dir Website und System.')}
              </h2>
              <p className="text-sm sm:text-base text-[#94A9AA] leading-relaxed">
                {t('Termine, Aufträge, Kunden und Rechnungen digital, so wie bei uns in der Werkstatt. Persönlich aus Neumarkt, mit Betreuung nach dem Start.')}
              </p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <ul className="flex flex-wrap gap-2">
                {ITEMS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white/[0.04] border border-white/10 text-zinc-200"
                  >
                    <Icon className="w-4 h-4 text-[#00F5D4]" />
                    {t(label)}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#FF8D4D] text-[#160B04] group-hover:brightness-110 transition-all">
                {t('Mehr erfahren')}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
};
