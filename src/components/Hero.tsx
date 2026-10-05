import React from 'react';
import { MessageSquare, Bot, ShieldCheck, Cpu } from 'lucide-react';
import { DeviceCategoryKey } from '../types';
import { LogicBoardScanner } from './LogicBoardScanner';

interface HeroProps {
  onSelectCategory: (cat: DeviceCategoryKey) => void;
  onOpenAiChat: (initialQuery?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectCategory, onOpenAiChat }) => {
  return (
    <section className="pt-2 pb-12 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Call-to-Actions */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#00F5D4] uppercase tracking-wider sm:tracking-widest px-2.5 sm:px-3 py-1.5 bg-[#00F5D4]/10 border border-[#00F5D4]/30 rounded-lg max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse shrink-0" />
              <span className="truncate sm:whitespace-normal">// CHIP-LEVEL HARDWARE LAB · NEUMARKT I.D.OPF.</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              Präzision bis auf <br className="hidden xs:inline" />
              <span className="bg-gradient-to-r from-white via-[#00F5D4] to-[#D48842] bg-clip-text text-transparent">
                Bauteilebene.
              </span>
            </h1>

            {/* Slogan */}
            <div className="bg-[#0C1517] border-l-2 border-[#D48842] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-r-lg">
              <p className="font-mono text-xs sm:text-base text-[#E5A96A] font-semibold leading-snug">
                »Reparieren statt Neukaufen, CODE bringt's zum Laufen.«
              </p>
            </div>

            <p className="text-zinc-300 text-xs sm:text-base leading-relaxed max-w-xl font-sans">
              Professionelle Platinenreparaturen für Gaming-Konsolen (PS5 HDMI, Hall-Effect Sticks), Laptops, MacBooks, Autoschlüssel-Elektronik und Notfall-Datenrettung direkt an der Werkbank in Neumarkt in der Oberpfalz.
            </p>

            {/* Quick-Action Bar */}
            <div className="bg-[#080E10]/90 border border-[#00F5D4]/25 rounded-2xl p-3 sm:p-5 space-y-2.5 sm:space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] sm:text-[11px] text-[#00F5D4] uppercase tracking-wider font-bold">
                  Defektes Gerät wählen:
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">Direkt zur Preisschätzung ↓</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCategory('laptop_pc')}
                  className="bg-[#0E171A] border border-[#00F5D4]/20 hover:border-[#00F5D4] hover:bg-[#00F5D4]/10 rounded-xl p-2 sm:p-3 text-center text-xs font-semibold flex flex-col items-center gap-1 sm:gap-1.5 transition-all group cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">💻</span>
                  <span className="text-white font-mono text-[9px] sm:text-[11px] font-bold truncate max-w-full">Laptop/PC</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory('konsole')}
                  className="bg-[#0E171A] border border-[#00F5D4]/20 hover:border-[#00F5D4] hover:bg-[#00F5D4]/10 rounded-xl p-2 sm:p-3 text-center text-xs font-semibold flex flex-col items-center gap-1 sm:gap-1.5 transition-all group cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">🎮</span>
                  <span className="text-white font-mono text-[9px] sm:text-[11px] font-bold truncate max-w-full">PS5/Konsole</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory('controller')}
                  className="bg-[#0E171A] border border-[#00F5D4]/20 hover:border-[#00F5D4] hover:bg-[#00F5D4]/10 rounded-xl p-2 sm:p-3 text-center text-xs font-semibold flex flex-col items-center gap-1 sm:gap-1.5 transition-all group cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">🕹️</span>
                  <span className="text-white font-mono text-[9px] sm:text-[11px] font-bold truncate max-w-full">Controller</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory('schluessel')}
                  className="bg-[#0E171A] border border-[#00F5D4]/20 hover:border-[#00F5D4] hover:bg-[#00F5D4]/10 rounded-xl p-2 sm:p-3 text-center text-xs font-semibold flex flex-col items-center gap-1 sm:gap-1.5 transition-all group cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">🔑</span>
                  <span className="text-white font-mono text-[9px] sm:text-[11px] font-bold truncate max-w-full">Schlüssel</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory('phone')}
                  className="bg-[#0E171A] border border-[#00F5D4]/20 hover:border-[#00F5D4] hover:bg-[#00F5D4]/10 rounded-xl p-2 sm:p-3 text-center text-xs font-semibold flex flex-col items-center gap-1 sm:gap-1.5 transition-all group cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform">📱</span>
                  <span className="text-white font-mono text-[9px] sm:text-[11px] font-bold truncate max-w-full">Handy</span>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-2.5 sm:gap-3 pt-1">
              <a
                href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20habe%20ein%20defektes%20Ger%C3%A4t%20und%20m%C3%B6chte%20eine%20Reparatur%20anfragen."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#25D366]/20 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-[#040809] transition-all shadow-[0_0_20px_rgba(37,211,102,0.25)] active:scale-95"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenAiChat()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-[#C9743F]/30 to-[#FF8D4D]/10 border border-[#FF8D4D] text-white hover:border-white hover:shadow-[0_0_25px_rgba(201,116,63,0.5)] transition-all cursor-pointer active:scale-95"
              >
                <Bot className="w-4 h-4 text-[#00F5D4] shrink-0" />
                <span>KI-Techniker</span>
              </button>
            </div>

            {/* Trust bulletpoints */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-mono text-[#839897] pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00F5D4] shrink-0" />
                <span>6 Monate Garantie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF8D4D] shrink-0" />
                <span>Bauteil-Mikrolöten 40x</span>
              </div>
            </div>
          </div>

          {/* Right Column: Logic Board Visualizer */}
          <div className="lg:col-span-6">
            <LogicBoardScanner />
          </div>
        </div>
      </div>
    </section>
  );
};
