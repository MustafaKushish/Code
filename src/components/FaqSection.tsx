import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  badge?: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'Warum ist eine Platinenreparatur oft 70 % günstiger als beim Hersteller?',
      a: 'Hersteller wie Apple, Sony oder Vertragswerkstätten tauschen fast nie einzelne Bauteile, sondern deklarieren einen Totalschaden oder berechnen den teuren Austausch der gesamten Hauptplatine (oft 300 € bis 700 €). Wir lokalisieren mit Mikroskop und Wärmebildkamera das einzelne defekte SMD-Bauteil (z. B. einen 2-Euro-Sperrkondensator oder einen USB-C-Port) und löten nur dieses neu ein. Das spart bares Geld und erhält deine Originaldaten.',
      badge: 'Ersparnis',
    },
    {
      q: 'Gerät ins Wasser gefallen: Warum hilft Reis NICHT und schadet sogar?',
      a: 'Reis entzieht zwar langsam oberflächliche Feuchtigkeit, beschleunigt jedoch die elektrochemische Korrosion im Inneren. Solange der Akku angeschlossen ist, fließen Kriechströme, die Leiterbahnen und Lötpads innerhalb von Stunden zerfressen. Reisstaub setzt sich zusätzlich unter BGA-Chips ab. Sofortmaßnahme: Gerät sofort stromlos machen (nicht mehr einschalten, nicht ans Ladekabel stecken) und so schnell wie möglich zur chemischen Isopropanol-Ultraschallreinigung in unsere Werkstatt bringen.',
      badge: 'Wasserschaden-Tipp',
    },
    {
      q: 'Was ist der Vorteil von Hall-Effect Analogsticks bei Controllern?',
      a: 'Herkömmliche Controller (PS5 DualSense, Xbox, Switch Joy-Con) nutzen mechanische Schleifkontakt-Potentiometer aus Kohleschicht. Nach einigen Monaten reibt sich das Material ab – der berüchtigte »Stick-Drift« entsteht. Unsere Hall-Effect-Sensoren messen die Position berührungslos über Magnetfelder (Permanentmagnete & Halbleitersensoren). Da kein mechanischer Kontakt schleift, ist der Stick praktisch unzerstörbar und driftfrei.',
      badge: 'Upgrade',
    },
    {
      q: 'Was bedeutet »No Data – No Fee« bei der Notfall-Datenrettung?',
      a: 'Wenn dein Smartphone, Laptop oder Speicher nach einem schweren Sturz oder Flüssigkeitsschaden tot ist, setzen wir alles daran, das Board temporär wieder bootfähig zu machen und deine Fotos, Videos, WhatsApp-Chats und Dokumente auszulesen. Sollten die internen Speicherchips physikalisch unwiederbringlich zerstört sein und keine Daten gerettet werden können, zahlst du für die Datenrettung 0,- €.',
      badge: 'Faire Garantie',
    },
    {
      q: 'Wie funktioniert der Ablauf per Postversand aus ganz Deutschland?',
      a: 'Ganz einfach: Kontaktiere uns kurz per WhatsApp oder Formular. Verpacke dein Gerät gut gepolstert in einem versicherten DHL-Paket und sende es an unsere Werkstatt in 92318 Neumarkt. Innerhalb von 24 Stunden nach Eingang untersuchen wir das Gerät unter dem Mikroskop, senden dir Fotos und eine verbindliche Diagnose. Nach deiner Freigabe wird gelötet, 4K-getestet und versichert zurückgesendet.',
      badge: 'Versand',
    },
  ];

  return (
    <section className="py-16 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Häufige Fragen &amp; Fachwissen
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Häufige Fragen zu Platinen &amp; Mikrolöten
          </h2>
          <p className="text-[#839897] text-sm">
            Ehrliche Antworten direkt von der Werkbank in Neumarkt.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0A1214]/90 border border-[#C9743F]/25 hover:border-[#4FA39B]/50 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#00F5D4] font-mono text-sm font-bold">0{idx + 1}.</span>
                    <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {faq.badge && (
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                        {faq.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-[#839897] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#00F5D4]' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#839897] leading-relaxed border-t border-white/5 bg-[#060B0D]/50 animate-fade-in">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
