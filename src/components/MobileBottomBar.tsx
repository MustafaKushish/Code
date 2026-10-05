import React from 'react';
import { MessageSquare, Phone, Bot } from 'lucide-react';

interface MobileBottomBarProps {
  onOpenAiChat: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenAiChat }) => {
  return (
    <>
      {/* Desktop & Tablet Floating AI Trigger (Bottom-Right) */}
      <button
        type="button"
        onClick={onOpenAiChat}
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-3 bg-[#0B1416]/95 border-1.5 border-[#C9743F] hover:border-[#00F5D4] rounded-full p-2 pr-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(201,116,63,0.3)] hover:shadow-[0_10px_35px_rgba(0,245,212,0.4)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
        aria-label="KI-Techniker für Fehlerdiagnose öffnen"
      >
        <div className="w-10 h-10 rounded-full bg-[#060B0C] border border-[#FF8D4D] flex items-center justify-center text-[#FF8D4D] group-hover:text-[#00F5D4] group-hover:border-[#00F5D4] transition-colors shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left font-mono">
          <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
            <span>KI-TECHNIKER</span>
            <span className="px-1 py-0.2 rounded text-[8px] bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40">
              3.1 PRO
            </span>
          </span>
          <span className="text-[10px] text-[#00F5D4] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
            <span>ONLINE • SCHALTPLAN-DIAGNOSE</span>
          </span>
        </div>
      </button>

      {/* Mobile Sticky Bottom HUD (< 768px) with iOS Safe-Area Support */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#060B0C]/95 backdrop-blur-xl border-t border-[#00F5D4]/20 p-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center gap-2 shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
        <a
          href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20habe%20eine%20Reparatur-Anfrage."
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] text-[#041009] font-mono font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.25)] active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href="tel:017641744443"
          className="flex-1 bg-[#C9743F] text-white font-mono font-bold text-xs py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(201,116,63,0.3)] active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4" />
          <span>Anrufen</span>
        </a>
        <button
          type="button"
          onClick={onOpenAiChat}
          className="bg-[#0E1F21] border border-[#00F5D4] text-[#00F5D4] font-mono font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,245,212,0.25)] cursor-pointer active:scale-95 transition-transform shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>KI</span>
        </button>
      </div>
    </>
  );
};
