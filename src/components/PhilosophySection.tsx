import React from 'react';
import { Leaf, TrendingDown, Scale } from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  return (
    <section id="haltung" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Philosophie &amp; Grundsätze
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Werterhalt statt Obsoleszenz
          </h2>
          <p className="text-[#839897] text-sm sm:text-base leading-relaxed">
            Industrielle Elektronikfertigung beansprucht enorme Primärrohstoffe und Energie. Wir betrachten Instandsetzung nicht als Behelfslösung, sondern als technologisch und ökonomisch überlegene Form des nachhaltigen Werterhalts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0D1618]/80 border border-[#C9743F]/25 rounded-2xl p-6 hover:border-[#00F5D4] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#00F5D4] mb-2">Ressourceneffizienz</h4>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed">
              Über 75 % der gesamten CO₂-Emissionen moderner IT-Hardware entstehen vor Inbetriebnahme im Rahmen der Halbleiter- und Platinenproduktion. Durch den präzisen Tausch einzelner SMD- und BGA-Komponenten verbleiben bis zu 99 % des Basismaterials im Lebenszyklus – giftiger Elektroschrott wird aktiv vermieden.
            </p>
          </div>

          <div className="bg-[#0D1618]/80 border border-[#C9743F]/25 rounded-2xl p-6 hover:border-[#FF8D4D] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FF8D4D]/10 border border-[#FF8D4D]/30 flex items-center justify-center text-[#FF8D4D] mb-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#FF8D4D] mb-2">Ökonomische Rationalität</h4>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed">
              Elektronische Defekte resultieren in den seltensten Fällen aus einem Totalversagen der Kernarchitektur, sondern meist aus peripherer Bauteilalterung oder mechanischer Beanspruchung. Gezielte Komponentenreparaturen sparen 60 bis 85 % gegenüber Neuanschaffungen – bei voller Funktions- und Datenkontinuität.
            </p>
          </div>

          <div className="bg-[#0D1618]/80 border border-[#C9743F]/25 rounded-2xl p-6 hover:border-white transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Diagnostische Integrität</h4>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed">
              Jeder Auftrag wird nach fundierten mess- und löttechnischen Parametern bewertet. Weist eine Baugruppe strukturelle Folgeschäden auf oder übersteigt der Aufwand den tatsächlichen Nutzwert, sprechen wir eine klare, sachliche Empfehlung aus. Wir setzen nur instand, was dauerhaft und betriebssicher funktioniert.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
