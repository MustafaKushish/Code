import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';

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

  // Strukturierte Daten (FAQPage) für Google – aus denselben Fragen wie auf der Seite
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.faq = 'true';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
    document.head.appendChild(script);
    return () => script.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="faq" className="py-16 md:py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <SectionHeading index="07" eyebrow="Häufige Fragen" title="Ehrliche Antworten von der Werkbank" />

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`reveal bg-[#0B1315]/90 border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-[#00F5D4]/35' : 'border-white/[0.08] hover:border-white/20'}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#00F5D4] font-mono text-sm font-bold">0{idx + 1}.</span>
                    <span className="font-semibold text-[15px] sm:text-base text-white leading-snug">{faq.q}</span>
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
                  <div className="px-5 sm:pl-14 pb-5 pt-1 text-sm text-[#A3B5B6] leading-relaxed animate-fade-in">
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
