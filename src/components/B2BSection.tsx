import React from 'react';
import { Handshake, Check, MessageSquare } from 'lucide-react';

const BENEFITS = [
  'Faire Partnerkonditionen & planbare Durchlaufzeiten',
  'Diskrete Abwicklung unter deinem eigenen Namen',
  'Kein Mindestvolumen – auch für dringende Einzelfälle',
];

export const B2BSection: React.FC = () => {
  return (
    <section id="b2b" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="reveal relative overflow-hidden rounded-3xl border border-[#00F5D4]/25 bg-[#071113] p-7 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pcb-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#00F5D4] px-3 py-1.5 rounded-full border border-[#00F5D4]/30 bg-[#00F5D4]/10 mb-4">
                <Handshake className="w-4 h-4" />
                Für Handy- & PC-Läden
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 text-balance">
                Platinenschaden? Schick deine Kunden nicht weg.
              </h2>
              <p className="text-sm sm:text-base text-[#94A9AA] leading-relaxed">
                HDMI-Port, Kurzschluss auf dem Board oder Mikrolöten nötig? Nutze CODE als regionalen B2B-Partner in Neumarkt
                i.d.OPf. – wir reparieren im Hintergrund zu fairen Werkstattpreisen.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-zinc-200">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00F5D4]/15 text-[#00F5D4] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20betreibe%20eine%20Werkstatt%20und%20habe%20Interesse%20an%20einer%20B2B-Kooperation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#00F5D4] text-[#04110F] hover:bg-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Partner werden</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
