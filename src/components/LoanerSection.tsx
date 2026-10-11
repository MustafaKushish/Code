import React from 'react';
import { Gamepad2, MessageSquare, RotateCcw } from 'lucide-react';
import { msg, useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';

const LOANER_MODELS = ['PS5 DualSense', 'Xbox Controller', 'Switch Pro'];

const POINTS = [
  msg('Gegen Pfand, das du bei der Abholung zurückbekommst'),
  msg('Bei Abgabe in Neumarkt, solange verfügbar'),
  msg('Einfach bei der Terminanfrage dazusagen'),
];

/** Leih-Controller während der Reparatur – Grund, zu CODE statt zur Konkurrenz zu gehen */
export const LoanerSection: React.FC = () => {
  const { t } = useI18n();
  return (
    <section id="leihgeraet" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="reveal relative overflow-hidden rounded-3xl border border-[#FF8D4D]/25 bg-gradient-to-br from-[#1A120D]/80 via-[#0B1315]/90 to-[#0B1315]/90 p-7 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#FFB98A] px-3 py-1.5 rounded-full border border-[#FF8D4D]/30 bg-[#FF8D4D]/10 mb-4">
                <RotateCcw className="w-4 h-4" />
                {t('Leihgerät')}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 text-balance">
                {t('Weiterzocken, während wir löten.')}
              </h2>
              <p className="text-sm sm:text-base text-[#94A9AA] leading-relaxed">
                {t('Dein Controller ist bei uns in Reparatur? Nimm so lange einen Leih-Controller mit nach Hause. So musst du auf nichts verzichten, bis deiner fertig ist.')}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {LOANER_MODELS.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/[0.04] border border-white/10 text-zinc-200"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-[#00F5D4]" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <ul className="space-y-3">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-zinc-200">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF8D4D] shrink-0" />
                    <span>{t(p)}</span>
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink(t('Hallo Mustafa, ich möchte meinen Controller reparieren lassen und brauche währenddessen einen Leih-Controller.'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('Leih-Controller anfragen')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
