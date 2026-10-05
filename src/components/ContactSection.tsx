import React from 'react';
import { MapPin, Phone, Mail, Clock, Package, MessageSquare } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="kontakt" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Werkstatt &amp; Anfahrt
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Direkter Ansprechpartner
          </h2>
          <p className="text-[#839897] text-sm">
            Inhabergeführt von Mustafa Al-Zurgany in Neumarkt in der Oberpfalz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Box 1: Contact info */}
          <div className="bg-[#0D1618]/90 border border-[#C9743F]/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-mono text-base font-bold text-[#FF8D4D] border-b border-white/10 pb-3 flex items-center gap-2">
              <span>&gt; KONTAKTANGABEN</span>
            </h3>

            <div className="space-y-4 text-xs sm:text-sm font-mono">
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
                  <a href="tel:017641744443" className="text-white hover:text-[#00F5D4] transition-colors block font-bold">
                    0176 4174 4443
                  </a>
                  <span className="text-[#839897] text-xs">Anruf &amp; WhatsApp Support</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FF8D4D] shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:mustafa.alzurgany@gmail.com" className="text-white hover:text-[#00F5D4] transition-colors block font-bold">
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
          </div>

          {/* Box 2: Nationwide Shipping / Mail-In */}
          <div className="bg-[#0D1618]/90 border border-[#00F5D4]/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] mx-auto mb-4">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="font-mono text-base sm:text-lg font-bold text-[#00F5D4] mb-2">
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
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all shadow-[0_0_15px_rgba(0,245,212,0.2)]"
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
