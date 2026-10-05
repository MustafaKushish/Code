import React from 'react';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Kontaktieren',
      desc: 'Schreib uns kurz per WhatsApp oder ruf an. Beschreibe kurz dein Gerät und den Fehler.',
    },
    {
      num: '2',
      title: 'Gerät übergeben',
      desc: 'Flexible Übergabe deines Geräts nach kurzer Terminabsprache bei uns an der Werkbank in Neumarkt.',
    },
    {
      num: '3',
      title: 'Reparatur & Test',
      desc: 'Instandsetzung unter dem Mikroskop, Beseitigung von Kurzschlüssen und gründliche Funktionsprüfung.',
    },
    {
      num: '4',
      title: 'Abholen & Fertig',
      desc: 'Du holst dein vollständig getestetes Gerät wieder ab – inklusive 6 Monaten Werkstatt-Garantie.',
    },
  ];

  return (
    <section id="ablauf" className="py-16 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Einfach &amp; Sicher
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            So funktioniert die Reparatur
          </h2>
          <p className="text-[#839897] text-sm">
            Unser bewährtes Modell für Neumarkt und Umgebung:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div
              key={st.num}
              className="bg-[#0D1618]/80 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-[#C9743F] text-white font-mono text-lg font-bold flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(201,116,63,0.4)]">
                {st.num}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
              <p className="text-xs sm:text-sm text-[#839897] leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
