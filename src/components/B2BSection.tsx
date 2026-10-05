import React from 'react';
import { Handshake, Check, MessageSquare } from 'lucide-react';

export const B2BSection: React.FC = () => {
  return (
    <section id="b2b" className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#00F5D4]/5 border border-[#00F5D4]/40 rounded-3xl p-8 sm:p-10 text-center shadow-[0_20px_50px_rgba(0,245,212,0.1)] relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center mx-auto mb-4 text-[#00F5D4]">
            <Handshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#00F5D4] mb-3">
            Du betreibst selbst einen Handy- oder PC-Laden in der Region?
          </h3>
          <p className="text-xs sm:text-sm text-[#839897] max-w-2xl mx-auto leading-relaxed mb-6">
            Musst du Kunden wegschicken, sobald ein Schaden auf der Platine liegt, ein HDMI-Port getauscht werden muss oder Mikrolöten nötig ist? Nutze CODE als deinen regionalen B2B-Partner in Neumarkt i.d.OPf. Wir reparieren im Hintergrund zu fairen Werkstattpreisen.
          </p>

          <div className="max-w-md mx-auto space-y-2 text-left text-xs text-[#F3F7F7] mb-8 font-mono">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00F5D4] shrink-0" />
              <span>Faire Partnerkonditionen &amp; planbare Durchlaufzeiten</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00F5D4] shrink-0" />
              <span>Diskrete Abwicklung unter deinem eigenen Kundennamen</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00F5D4] shrink-0" />
              <span>Kein Mindestvolumen – auch für dringende Einzelfälle</span>
            </div>
          </div>

          <a
            href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20betreibe%20eine%20Werkstatt%20und%20habe%20Interesse%20an%20einer%20B2B-Kooperation."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#00F5D4] text-[#060B0C] hover:bg-white transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>B2B-Kooperation anfragen</span>
          </a>
        </div>
      </div>
    </section>
  );
};
