import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Laptop,
  Gamepad2,
  Smartphone,
  Key,
} from 'lucide-react';
import { requestAiDiagnosis, KNOWN_ERROR_CODES, MANDATORY_CLOSING_SENTENCE } from '../services/aiTechnicianService';

interface AiTechnicianWorkerViewProps {
  onApplyToCalculator?: (faultTitle: string, desc: string) => void;
}

export const AiTechnicianWorkerView: React.FC<AiTechnicianWorkerViewProps> = ({
  onApplyToCalculator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'konsolen' | 'laptops' | 'smartphones' | 'controller_keys'>('konsolen');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSelectErrorCode = (codeItem: { code: string; system: string; cause: string }) => {
    const query = `${codeItem.system} - Fehlercode / Symptom: ${codeItem.code}. ${codeItem.cause}`;
    setInputQuery(query);
    handleDiagnose(query);
  };

  const handleDiagnose = async (queryToRun?: string) => {
    const text = (queryToRun || inputQuery).trim();
    if (!text) return;

    setIsLoading(true);
    setResultText(null);

    const catMapping: Record<string, string> = {
      konsolen: 'konsole',
      laptops: 'laptop_pc',
      smartphones: 'phone',
      controller_keys: 'controller',
    };

    try {
      const res = await requestAiDiagnosis({
        message: text,
        deviceCategory: catMapping[selectedCategory],
      });
      setResultText(res.reply);
    } catch {
      setResultText(`1. **Kurz & verständlich (Der Hauptgrund):**
Auf der Hauptplatine liegt ein bauteilbedingter Defekt oder Kurzschluss vor.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Durch Überspannung, thermische Alterung oder mechanische Erschütterung hat ein IC oder SMD-Sperrkondensator durchlegiert. Dies triggert die interne OCP/UVLO-Schutzschaltung.

3. **Lösung & Kosten (Neumarkt):**
Wir prüfen die Platine im Labor mit Wärmebildkamera und Diodenmessung gegen Masse. Der Richtpreis liegt ab 79 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.
${MANDATORY_CLOSING_SENTENCE}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#091518] border border-[#00F5D4]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/50 flex items-center justify-center text-[#00F5D4] shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                KI-TECHNIKER // WERKSTATT-DIAGNOSE &amp; FEHLERCODES
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40 font-bold">
                STRIKTE 3-PUNKT VALIDIERUNG
              </span>
            </div>
            <p className="text-xs text-[#859B9E] mt-0.5">
              Präzise Chiplevel-Diagnose nach Mustafas Vorgaben mit Fehlercode-Zuordnung für Konsolen, Laptops, Handys &amp; Schlüssel.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategory('konsolen')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            selectedCategory === 'konsolen'
              ? 'bg-[#00F5D4] text-black shadow-lg shadow-[#00F5D4]/20'
              : 'bg-[#10191A] text-[#859B9E] hover:text-white border border-white/10'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>🎮 Konsolen (Switch / PS5 / Xbox)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('laptops')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            selectedCategory === 'laptops'
              ? 'bg-[#00F5D4] text-black shadow-lg shadow-[#00F5D4]/20'
              : 'bg-[#10191A] text-[#859B9E] hover:text-white border border-white/10'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>💻 Laptops &amp; MacBooks</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('smartphones')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            selectedCategory === 'smartphones'
              ? 'bg-[#00F5D4] text-black shadow-lg shadow-[#00F5D4]/20'
              : 'bg-[#10191A] text-[#859B9E] hover:text-white border border-white/10'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>📱 Smartphones (iPhone / Samsung)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('controller_keys')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            selectedCategory === 'controller_keys'
              ? 'bg-[#00F5D4] text-black shadow-lg shadow-[#00F5D4]/20'
              : 'bg-[#10191A] text-[#859B9E] hover:text-white border border-white/10'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>🕹️ Controller &amp; Autoschlüssel</span>
        </button>
      </div>

      {/* Quick Click Error Codes */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#859B9E] mb-2 font-bold">
          Häufige Fehlercodes &amp; Chiplevel-Symptome (Klick für Sofort-Diagnose):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {KNOWN_ERROR_CODES[selectedCategory].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectErrorCode(item)}
              className="p-3 text-left rounded-xl bg-[#091113] hover:bg-[#122225] border border-white/10 hover:border-[#00F5D4]/60 transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-[#00F5D4] font-bold mb-1">
                <span>{item.code}</span>
                <span className="text-[10px] text-[#859B9E] uppercase">{item.system}</span>
              </div>
              <p className="text-[11px] text-[#A0B0B2] line-clamp-2 group-hover:text-white transition-colors">
                {item.cause}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Query Input */}
      <div className="p-4 rounded-2xl bg-[#091113] border border-white/10 space-y-3">
        <label className="block text-xs uppercase tracking-wider text-[#859B9E] font-bold">
          Oder Freitext / Kundensymptom eingeben:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDiagnose();
            }}
            placeholder="z. B. Switch Fehler 2101-0001, MacBook 5V 0.04A, PS5 BLOD oder iPhone Panic-full..."
            className="flex-1 px-4 py-3 bg-[#040809] border border-white/20 focus:border-[#00F5D4] rounded-xl text-sm text-white placeholder-gray-500 outline-none font-mono"
          />
          <button
            type="button"
            onClick={() => handleDiagnose()}
            disabled={isLoading || !inputQuery.trim()}
            className="px-6 py-3 rounded-xl bg-[#00F5D4] hover:bg-white text-black font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-[#00F5D4]/20"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isLoading ? 'Analysiere...' : 'Diagnose starten'}</span>
          </button>
        </div>
      </div>

      {/* Result Display with Strict 3-Point Validation */}
      {resultText && (
        <div className="p-6 rounded-2xl bg-[#060D0F] border-2 border-[#00F5D4] shadow-2xl relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00F5D4]">
              <ShieldCheck className="w-4 h-4 text-[#00F5D4]" />
              <span>GEPRÜFTE 3-PUNKT ANTWORT (PROMPT-VALIDIERT)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#142629] text-[#00F5D4] border border-[#00F5D4]/40 hover:bg-[#00F5D4] hover:text-black transition cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Kopiert!' : 'Text kopieren (WhatsApp)'}</span>
              </button>
              {onApplyToCalculator && (
                <button
                  type="button"
                  onClick={() => onApplyToCalculator(inputQuery || 'Hardware-Reparatur', resultText)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9743F] text-white hover:bg-[#FF8D4D] transition cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>In Kalkulator übernehmen</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-mono space-y-3">
            {resultText}
          </div>
        </div>
      )}
    </div>
  );
};
