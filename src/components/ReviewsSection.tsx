import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="bewertungen" className="py-16 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Vertrauen
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Ihre Meinung zählt
          </h2>
          <p className="text-[#839897] text-sm">
            Echte Erfahrungsberichte schaffen mehr Vertrauen als jedes Werbeversprechen.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-[#0D1618]/80 border-2 border-dashed border-[#C9743F]/35 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#00F5D4]/15 text-[#00F5D4] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,245,212,0.2)]">
            <Star className="w-7 h-7 fill-[#00F5D4] stroke-none" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Waren Sie schon bei CODE in Neumarkt?
          </h3>
          <p className="text-xs sm:text-sm text-[#839897] leading-relaxed max-w-md">
            Eine kurze Google-Bewertung dauert eine Minute und hilft der nächsten Person mit kaputtem Gerät bei der Entscheidung.
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=CODE+Neumarkt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all shadow-[0_0_15px_rgba(0,245,212,0.2)] mt-2"
          >
            <span>Jetzt bei Google bewerten</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
