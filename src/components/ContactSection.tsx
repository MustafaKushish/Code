import React from 'react';
import { MapPin, Phone, Mail, Clock, Package, MessageSquare, Navigation } from 'lucide-react';
import { getOpeningStatus } from '../utils/openingHours';
import { SectionHeading } from './ui/SectionHeading';

export const ContactSection: React.FC = () => {
  const opening = getOpeningStatus();
  return (
    <section id="kontakt" className="py-16 md:py-24 relative section-band">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          index="09"
          eyebrow="Kontakt"
          title="Direkt zum Techniker"
          intro="Inhabergeführt von Mustafa Al-Zurgany in Neumarkt in der Oberpfalz – kein Callcenter, keine Weiterleitung."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Box 1: Contact info */}
          <div className="reveal bg-[#0B1315]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white">Werkstatt Neumarkt</h3>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  opening.open ? 'text-[#7CF5C4] bg-[#00F5D4]/10' : 'text-[#FFB98A] bg-[#FF8D4D]/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opening.open ? 'bg-[#00F5D4] animate-pulse' : 'bg-[#FF8D4D]'}`} />
                {opening.open ? 'Geöffnet' : 'Geschlossen'}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FF8D4D] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-bold">92318 Neumarkt in der Oberpfalz</span>
                  <span className="text-[#839897] text-xs">Termin nach kurzer Absprache an der Werkbank</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FF8D4D] shrink-0 mt-0.5" />
                <div>
                  <a href="tel:017641744443" className="text-white hover:text-[#00F5D4] transition-colors block font-semibold">
                    0176 4174 4443
                  </a>
                  <span className="text-[#839897] text-xs">Anruf &amp; WhatsApp Support</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FF8D4D] shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:mustafa.alzurgany@gmail.com" className="text-white hover:text-[#00F5D4] transition-colors block font-semibold">
                    mustafa.alzurgany@gmail.com
                  </a>
                  <span className="text-[#839897] text-xs">Schriftliche Anfragen &amp; Rechnungen</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#FF8D4D] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white block font-bold">Mo–Fr: 10:00–18:00 Uhr</span>
                  <span className="text-[#839897] text-xs">Sa: 10:00–14:00 Uhr | So: Geschlossen</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="tel:+4917641744443"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold bg-white/[0.06] border border-white/10 text-white hover:border-[#00F5D4]/60 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#00F5D4]" />
                Anrufen
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=CODE+IT-Werkstatt+Neumarkt+in+der+Oberpfalz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold bg-white/[0.06] border border-white/10 text-white hover:border-[#FF8D4D]/60 transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#FF8D4D]" />
                Route
              </a>
            </div>
          </div>

          {/* Box 2: Nationwide Shipping / Mail-In */}
          <div className="reveal relative overflow-hidden bg-[#071113] border border-[#00F5D4]/25 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] mx-auto mb-4">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Deutschlandweiter Versandservice
              </h3>
              <p className="text-xs sm:text-sm text-[#839897] leading-relaxed max-w-md mx-auto mb-6">
                Nicht aus Neumarkt? Sende deinen Laptop, deine Konsole, deinen Autoschlüssel oder dein Smartphone sicher per Post ein.
                Mikroskop-Diagnose innerhalb von 24 Stunden nach Paketeingang.
              </p>
            </div>
            <a
              href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20m%C3%B6chte%20ein%20Ger%C3%A4t%20zur%20Reparatur%20einsenden."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold bg-[#00F5D4] text-[#04110F] hover:bg-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Versand anfragen</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
