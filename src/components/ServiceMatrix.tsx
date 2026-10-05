import React from 'react';
import { Check } from 'lucide-react';

export const ServiceMatrix: React.FC = () => {
  return (
    <section id="services" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">
            // Leistungsspektrum
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Echtes Handwerk auf Platinenebene
          </h2>
          <p className="text-[#839897] text-sm sm:text-base leading-relaxed">
            Wo herkömmliche Werkstätten aufgeben und nur teure Neuteile verkaufen wollen, reparieren wir direkt auf Bauteilebene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Laptop & MacBook */}
          <div className="bg-[#0D1618]/80 hover:bg-[#132124]/90 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">💻</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Laptop, MacBook &amp; PC-Systeme
            </h3>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">
              Präzise Fehlerbehebung bei toten Boards, Flüssigkeitsschäden, USB-C Ladebuchsen oder extremer Überhitzung von CPU &amp; GPU.
            </p>
            <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Logic-Board:</strong> Kurzschlusssuche &amp; Power-Rail Reparatur</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Wasserschaden:</strong> Ultraschall-Reinigung &amp; Entsalzung</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Wartung:</strong> Lüfterreinigung, Thermal Grizzly / Flüssigmetall</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Buchsen:</strong> USB-C Power Delivery Buchsen professionell gelötet</span>
              </li>
            </ul>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
              Windows &amp; macOS Profi
            </span>
          </div>

          {/* Card 2: Konsolen & Controller */}
          <div className="bg-[#0D1618]/80 hover:bg-[#132124]/90 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🎮</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Gaming-Konsolen &amp; Controller
            </h3>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">
              Fachgerechter Austausch ausgerissener Buchsen, Behebung von Abschaltungen durch Überhitzung und langlebige Controller-Upgrades.
            </p>
            <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>PS5 / Xbox:</strong> Neuer OEM-HDMI-Port professionell eingelötet</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Überhitzungsschutz:</strong> Erneuerung des Flüssigmetalls &amp; Politur</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Hall-Effect Sticks:</strong> Magnet-Sensoren gegen Stick-Drift</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>Nintendo Switch:</strong> USB-C Buchsen &amp; M92T36 Power-IC Reparatur</span>
              </li>
            </ul>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
              Beliebtes Upgrade
            </span>
          </div>

          {/* Card 3: Autoschlüssel */}
          <div className="bg-[#0D1618]/80 hover:bg-[#132124]/90 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔑</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Autoschlüssel &amp; Funkschlüssel
            </h3>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">
              Ein neuer Schlüssel im Autohaus kostet schnell 250 € bis 500 €. Wir setzen deine Originalplatine wieder vollständig instand.
            </p>
            <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Erneuerung gebrochener Mikrotaster &amp; SMD-Schalter</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Austausch fest verlöteter Akkus (z. B. BMWフラッシュ)</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Gehäusetausch &amp; Reparatur gerissener Leiterbahnen</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Frequenz- und Transponderprüfung vor Ort (433 / 868 MHz)</span>
              </li>
            </ul>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
              Spart bis zu 80%
            </span>
          </div>

          {/* Card 4: Notfall-Datenrettung */}
          <div className="bg-[#0D1618]/80 hover:bg-[#132124]/90 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">💾</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Chip-Level Notfall-Datenrettung
            </h3>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">
              Sicherung deiner Fotos, WhatsApp-Chats und Firmenunterlagen von scheinbar »toten« oder schwer beschädigten Geräten.
            </p>
            <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Smartphones &amp; Laptops nach extremem Flüssigkeitsschaden</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Kurzschlussbeseitigung auf Hauptstromschienen (VDD_MAIN)</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Reparatur defekter Lade- &amp; Power-ICs</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span><strong>No Data – No Fee:</strong> Keine Kosten bei erfolgloser Rettung!</span>
              </li>
            </ul>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
              100% Diskretion
            </span>
          </div>

          {/* Card 5: Mikrolöten & B2B */}
          <div className="bg-[#0D1618]/80 hover:bg-[#132124]/90 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔬</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Mikrolöten &amp; Platinenservice
            </h3>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">
              SMD-, QFN- und BGA-Arbeiten unter dem Mikroskop für Privatkunden sowie als verlässlicher Subunternehmer für Werkstätten.
            </p>
            <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Instandsetzung abgerissener Lötaugen &amp; Pads (Jumper Wires)</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Kurzschlusssuche via Wärmebildkamera &amp; Multimeter</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>B2B-Partnerkonditionen für Reparaturwerkstätten</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Schnelle Durchlaufzeiten ohne lange Wartezeiten</span>
              </li>
            </ul>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
              B2B Partner-Netz
            </span>
          </div>

          {/* Card 6: Smartphone & Tablet */}
          <div className="bg-[#0D1618]/80 hover:bg-[#132124]/90 border border-[#C9743F]/25 hover:border-[#FF8D4D] rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📱</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Smartphone &amp; Tablet Service
            </h3>
            <p className="text-xs sm:text-sm text-[#839897] leading-relaxed mb-4">
              Der bewährte Klassiker mit geprüften Qualitätsersatzteilen und 6 Monaten Garantie auf alle durchgeführten Arbeiten.
            </p>
            <ul className="space-y-2 border-t border-white/10 pt-4 mb-4 text-xs">
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Display- &amp; Akkutausch (Apple iPhone, Samsung, Pixel etc.)</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Ladebuchsen-, Lautsprecher- und Kameratausch</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Lade-IC Reparaturen bei iPad &amp; iPhone (Tristar / Hydra)</span>
              </li>
              <li className="flex items-center gap-2 text-[#F3F7F7]">
                <Check className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                <span>Geprüfte Erstausrüster- oder Original-Qualität</span>
              </li>
            </ul>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
              Express nach Absprache
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
