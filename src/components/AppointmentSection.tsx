import React from 'react';
import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';

export const AppointmentSection: React.FC = () => {
  return (
    <section id="termin" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          index="08"
          eyebrow="Termin"
          title="Ohne Wartezeit an die Werkbank"
          intro="Wunsch-Slot für Übergabe oder Abholung in Neumarkt wählen – wir schauen uns den Schaden direkt gemeinsam an."
        />

        <div className="reveal max-w-3xl mx-auto bg-[#0B1315]/90 border border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-2xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4] mx-auto mb-6 shadow-[0_0_20px_rgba(0,245,212,0.25)]">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Persönlicher Werkstatt-Slot in Neumarkt
          </h3>
          <p className="text-xs sm:text-sm text-[#839897] max-w-lg mx-auto leading-relaxed mb-8">
            Verbindliche Reservierung ohne Anstehen. Wir nehmen uns Zeit, begutachten den Schaden direkt gemeinsam und klären alle Fragen.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              data-cal-link="mustafa-al-zurgany-cfwhg8/code-werkstatt"
              data-cal-config='{"layout":"month_view","theme":"dark"}'
              className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl text-[15px] font-semibold text-[#160B04] bg-gradient-to-b from-[#FFA060] to-[#D9783E] hover:brightness-110 shadow-[0_10px_30px_rgba(217,120,62,0.35)] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Termin an der Werkbank buchen</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#94A9AA] mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#00F5D4]" />
              <span>Sofortige Bestätigung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF8D4D]" />
              <span>Automatische Kalendereintragung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#00F5D4]" />
              <span>92318 Neumarkt i.d.OPf.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
