import React from 'react';
import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';

export const AppointmentSection: React.FC = () => {
  return (
    <section id="termin" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Direkte Werkbank-Termine
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Keine Wartezeit: Termin buchen
          </h2>
          <p className="text-[#839897] text-sm">
            Wähle deinen Wunsch-Slot für eine persönliche Übergabe oder Abholung direkt an unserer Werkbank in Neumarkt i.d.OPf.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-[#0D1618]/90 border border-[#C9743F]/30 rounded-3xl p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
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
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#00F5D4] text-[#060B0C] hover:bg-white transition-all shadow-[0_0_25px_rgba(0,245,212,0.35)] cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>📅 Termin an der Werkbank buchen</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#839897] mt-8 pt-6 border-t border-white/10">
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
