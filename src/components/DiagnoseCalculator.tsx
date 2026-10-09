import React, { useState } from 'react';
import { Bot, Clock, Zap, MessageSquare, ChevronDown, Check, FileText, Search, Sparkles, Layers } from 'lucide-react';
import { SectionHeading } from './ui/SectionHeading';
import { DeviceCategoryKey, FaultItem, CategoryType } from '../types';
import { CATEGORY_LABELS, REPAIR_DATA } from '../data/repairData';

interface DiagnoseCalculatorProps {
  currentCategory: DeviceCategoryKey;
  onSelectCategory: (cat: DeviceCategoryKey) => void;
  onOpenAiChat: (initialQuery?: string) => void;
}

const SUB_FILTERS: { key: 'all' | CategoryType; label: string; icon: string; shortLabel: string }[] = [
  { key: 'all', label: 'Alle Ebenen', shortLabel: 'Alle', icon: '⚡' },
  { key: 'display', label: 'Display & Optik', shortLabel: 'Display', icon: '🖥️' },
  { key: 'module', label: 'Module & Akku', shortLabel: 'Module/Akku', icon: '🔋' },
  { key: 'board', label: 'Platine & Mikrolöten', shortLabel: 'Platine', icon: '🔬' },
  { key: 'software', label: 'Software & Firmware', shortLabel: 'Software', icon: '💾' },
];

const LAYER_BADGES: Record<CategoryType, { label: string; icon: string; color: string }> = {
  display: { label: 'Display & Optik', icon: '🖥️', color: 'border-blue-400/40 text-blue-300 bg-blue-500/10' },
  module: { label: 'Module & Akku', icon: '🔋', color: 'border-amber-400/40 text-amber-300 bg-amber-500/10' },
  board: { label: 'Platine & Mikrolöten', icon: '🔬', color: 'border-[#C9743F]/50 text-[#FF8D4D] bg-[#C9743F]/10' },
  software: { label: 'Software & Firmware', icon: '💾', color: 'border-[#00F5D4]/40 text-[#00F5D4] bg-[#00F5D4]/10' },
};

export const DiagnoseCalculator: React.FC<DiagnoseCalculatorProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenAiChat,
}) => {
  const [activeSubFilter, setActiveSubFilter] = useState<'all' | CategoryType>('all');
  const [selectedFaultId, setSelectedFaultId] = useState<string>('');
  const [isExpressChecked, setIsExpressChecked] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allCategoryFaults: FaultItem[] = REPAIR_DATA[currentCategory] || REPAIR_DATA.phone;

  // Filter faults by activeSubFilter and searchQuery
  const displayedFaults = allCategoryFaults.filter((f) => {
    const matchesFilter = activeSubFilter === 'all' || f.categoryType === activeSubFilter;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      f.title.toLowerCase().includes(query) ||
      f.desc.toLowerCase().includes(query) ||
      f.steps.some((s) => s.toLowerCase().includes(query))
    );
  });

  // Current selected fault (falls back safely)
  const currentFault: FaultItem =
    displayedFaults.find((f) => f.id === selectedFaultId) ||
    displayedFaults[0] ||
    allCategoryFaults[0];

  // Price calculations
  const baseTarget = currentFault.targetTotal;
  const expressActive = Boolean(currentFault.express && isExpressChecked);
  const expressSurcharge = expressActive ? currentFault.express || 0 : 0;
  const finalTotal = baseTarget + expressSurcharge;

  const laborNet = currentFault.laborNet;
  const partsNet = currentFault.partsNet;
  const subtotalNet = laborNet + partsNet;
  const taxNet = subtotalNet * 0.19;

  // Dynamic savings vs buying new
  const savings = currentFault.newDevicePrice
    ? Math.max(0, currentFault.newDevicePrice - finalTotal)
    : 0;

  const handleCategorySwitch = (cat: DeviceCategoryKey) => {
    onSelectCategory(cat);
    setActiveSubFilter('all');
    setSelectedFaultId('');
    setIsExpressChecked(false);
    setSearchQuery('');
  };

  const handleSubFilterClick = (filterKey: 'all' | CategoryType) => {
    setActiveSubFilter(filterKey);
    setSelectedFaultId('');
    setIsExpressChecked(false);
  };

  const generateWhatsAppMessage = () => {
    const text = `Hallo Mustafa, ich habe auf code-ger.de die 4-Ebenen-Diagnose genutzt:
Gerät: ${CATEGORY_LABELS[currentCategory].label}
Schadensebene: ${LAYER_BADGES[currentFault.categoryType]?.label || 'Standard'}
Defekt: ${currentFault.title}${expressActive ? ' (+ Express-Service)' : ''}
Geschätzter Preisrahmen: ab ${finalTotal.toFixed(2).replace('.', ',')} € (inkl. 19% MwSt.)
Geschätzte Dauer: ${expressActive ? 'Vorrang / meist am selben Tag' : currentFault.time}

Wann kann ich das Gerät zur Reparatur in Neumarkt übergeben?`;
    return `https://wa.me/4917641744443?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="diagnose" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <SectionHeading
          index="01"
          eyebrow="Preise & Diagnose"
          title="Was kostet meine Reparatur?"
          intro="Gerät wählen, Schaden eingrenzen – du siehst sofort den Festpreisrahmen und was du gegenüber einem Neukauf sparst."
        />

        {/* Diagnosis HUD Container */}
        <div className="max-w-5xl mx-auto bg-[#0A1214]/95 border border-[#C9743F]/30 rounded-3xl p-5 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* KI-Techniker Banner */}
          <button
            type="button"
            onClick={() => onOpenAiChat(`Mein ${CATEGORY_LABELS[currentCategory].label} hat folgendes Problem: ${currentFault.title}`)}
            className="w-full text-left bg-gradient-to-r from-[#101D20] via-[#0E1A1C] to-[#0A1214] border border-[#4FA39B]/50 hover:border-[#00F5D4] rounded-2xl p-4 sm:p-5 mb-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 group shadow-lg cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#070D0E] border border-[#00F5D4]/40 flex items-center justify-center shrink-0 text-[#00F5D4] group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(0,245,212,0.4)] transition-all">
              <Bot className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#00F5D4] uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
                <span>// DIGITALE ERSTEINSCHÄTZUNG</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-[#00F5D4] transition-colors">
                KI-Techniker: Schadensebene nicht eindeutig?
              </h3>
              <p className="text-xs sm:text-sm text-[#839897] leading-relaxed">
                Beschreibe dein Symptom in eigenen Worten oder lade ein Foto hoch. Unser KI-Techniker grenzt ein, ob Display, Modul, Lade-IC oder Firmware betroffen ist.
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono font-bold px-3.5 py-2 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 text-[#00F5D4] group-hover:bg-[#00F5D4] group-hover:text-[#060B0C] transition-all">
              &gt; JETZT MIT KI PRÜFEN
            </span>
          </button>

          {/* 1. Haupt-Geräteauswahl */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            {(Object.keys(CATEGORY_LABELS) as DeviceCategoryKey[]).map((catKey) => {
              const info = CATEGORY_LABELS[catKey];
              const isActive = currentCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => handleCategorySwitch(catKey)}
                  className={`py-3 px-2 rounded-xl border text-center font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C9743F]/25 border-[#FF8D4D] text-white shadow-[0_0_15px_rgba(201,116,63,0.35)] -translate-y-0.5'
                      : 'bg-[#0E1A1C]/90 border-[#C9743F]/20 text-[#839897] hover:border-[#4FA39B]/50 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className="font-semibold">{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Sub-Filter-Leiste (Das 4-Ebenen-System) */}
          <div className="mb-6 bg-[#070D0F] border border-white/10 rounded-2xl p-2 sm:p-2.5">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-[11px] font-mono text-[#00F5D4] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>Schadensebene wählen:</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {displayedFaults.length} {displayedFaults.length === 1 ? 'Eintrag' : 'Einträge'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SUB_FILTERS.map((filter) => {
                const isActive = activeSubFilter === filter.key;
                const count =
                  filter.key === 'all'
                    ? allCategoryFaults.length
                    : allCategoryFaults.filter((f) => f.categoryType === filter.key).length;

                // Don't render empty layers for categories that don't have them
                if (count === 0 && filter.key !== 'all') return null;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => handleSubFilterClick(filter.key)}
                    className={`px-3 py-2 rounded-xl font-mono text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00F5D4] text-[#060B0C] font-bold shadow-[0_0_12px_rgba(0,245,212,0.35)] scale-[1.02]'
                        : 'bg-[#0E181A] border border-white/10 text-zinc-300 hover:border-[#00F5D4]/40 hover:text-white'
                    }`}
                  >
                    <span>{filter.icon}</span>
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">{filter.shortLabel}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#060B0C]/20 text-[#060B0C]' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symptom Search Bar */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-[#839897] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Symptom suchen (z. B. Display, Akku, Lade-IC, Bootloop, Flüssigkeit, HDMI)..."
              className="w-full bg-[#060D0E] border border-[#C9743F]/25 focus:border-[#00F5D4] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#839897] outline-none font-mono"
            />
          </div>

          {/* Fault Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {displayedFaults.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-[#070D0E] border border-dashed border-white/15 rounded-2xl p-6 font-mono text-xs text-zinc-400">
                Keine Fehler für diese Ebene oder Suche gefunden.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-[#00F5D4] underline font-bold ml-1 cursor-pointer"
                >
                  Alle Ebenen anzeigen
                </button>
              </div>
            ) : (
              displayedFaults.map((f) => {
                const isSelected = (currentFault && currentFault.id === f.id) || false;
                const badge = LAYER_BADGES[f.categoryType];
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFaultId(f.id);
                      setIsExpressChecked(false);
                    }}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#00F5D4]/10 border-[#00F5D4] shadow-[0_0_15px_rgba(0,245,212,0.2)]'
                        : 'bg-[#0E1A1C]/60 border-[#C9743F]/20 hover:border-[#4FA39B]/40 hover:bg-[#122225]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {badge && (
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-md border ${badge.color}`}
                          >
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        )}
                        <span className="font-mono text-[11px] font-bold text-[#FF8D4D]">
                          ab {f.targetTotal.toFixed(0)} €
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#00F5D4] text-[#060B0C] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <strong className="text-sm sm:text-base font-bold text-white block mb-1">
                      {f.title}
                    </strong>
                    <span className="text-xs text-[#839897] leading-relaxed block">{f.desc}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Pricing & Customer Outcome Display Card */}
          <div className="bg-[#050B0D] border border-[#C9743F]/30 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[#839897] uppercase tracking-wider block">
                  Geschätzter Reparaturpreis (Festpreisrahmen):
                </span>
                {LAYER_BADGES[currentFault.categoryType] && (
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      LAYER_BADGES[currentFault.categoryType].color
                    }`}
                  >
                    Ebene: {LAYER_BADGES[currentFault.categoryType].label}
                  </span>
                )}
              </div>

              <div className="text-3xl sm:text-5xl font-extrabold text-[#FF8D4D] tracking-tight">
                ab {finalTotal.toFixed(2).replace('.', ',')} €{' '}
                <span className="text-xs sm:text-sm font-normal font-mono text-[#839897]">
                  inkl. 19% MwSt.{expressActive ? ' + Express' : ''}
                </span>
              </div>

              {/* Dynamic Savings Display (Ersparnis-Visualisierung) */}
              {savings > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00F5D4]/15 via-[#00F5D4]/10 to-transparent border border-[#00F5D4]/40 text-[#00F5D4] text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,245,212,0.15)]">
                  <Sparkles className="w-4 h-4 text-[#00F5D4] shrink-0 animate-pulse" />
                  <span>Vergleich zum Neukauf: Du sparst bis zu {savings.toFixed(0)} €!</span>
                </div>
              )}

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#00F5D4]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    Dauer:{' '}
                    <strong className="text-white">
                      {expressActive ? 'Vorrang / meist am selben Tag' : currentFault.time}
                    </strong>
                  </span>
                </div>
                {currentFault.compare && (
                  <div className="text-[#FF8D4D] font-semibold">💡 {currentFault.compare}</div>
                )}
              </div>

              <div className="text-xs font-mono text-[#839897] flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>✓ Verbindlicher Festpreis vor Arbeitsbeginn</span>
                <span>•</span>
                <span>✓ 6 Monate Garantie</span>
                <span>•</span>
                <span>✓ No Data – No Fee</span>
              </div>

              {/* Express Toggle */}
              {currentFault.express && (
                <label className="flex items-center gap-3 bg-[#FF8D4D]/10 border border-[#FF8D4D]/30 rounded-xl px-4 py-2.5 cursor-pointer max-w-md">
                  <input
                    type="checkbox"
                    checked={isExpressChecked}
                    onChange={(e) => setIsExpressChecked(e.target.checked)}
                    className="w-4 h-4 accent-[#FF8D4D] rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FF8D4D]" />
                    <span>⚡ Express-Service • Vorrang-Bearbeitung</span>
                  </span>
                  <span className="ml-auto text-xs font-mono text-[#FF8D4D] font-bold">
                    +{currentFault.express.toFixed(0)} €
                  </span>
                </label>
              )}

              {/* Cross-Sell Hint */}
              {currentFault.crossSell && (
                <div className="bg-[#4FA39B]/15 border border-[#00F5D4]/30 rounded-xl px-4 py-2.5 text-xs text-[#00F5D4] leading-relaxed">
                  💡 {currentFault.crossSell}
                </div>
              )}
            </div>

            {/* Action Buttons Column */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#25D366] text-[#040809] hover:bg-[#20ba5a] shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Dieses Problem anfragen</span>
              </a>

              <button
                type="button"
                onClick={() =>
                  onOpenAiChat(
                    `Ich benötige Hilfe zu: ${currentFault.title} (${CATEGORY_LABELS[currentCategory].label})`
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#101E21] border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>KI-Techniker fragen</span>
              </button>

              <a
                href={`https://wa.me/4917641744443?text=${encodeURIComponent(
                  `Hallo Mustafa, ich benötige für meine Versicherung (Haftpflicht/Hausrat) einen schriftlichen Kostenvoranschlag (KVA) über das CODE WWS für mein Gerät: ${CATEGORY_LABELS[currentCategory].label} – ${currentFault.title}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-mono text-[11px] text-[#FF8D4D] hover:text-white border border-[#FF8D4D]/30 hover:border-[#FF8D4D] hover:bg-[#FF8D4D]/10 transition-colors"
                title="Schriftlicher Kostenvoranschlag für Versicherungen über das Werkstattsystem CODE WWS"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Schriftlichen KVA (Versicherung) anfragen</span>
              </a>

              <div className="text-[10px] font-mono text-[#839897] leading-relaxed text-center px-1">
                ℹ️ <strong>Hinweis:</strong> Schriftliche Kostenvoranschläge für Versicherungen (Haftpflicht / Hausrat) werden nach Labor-Prüfung über unser Werkstattsystem (CODE WWS) erstellt und bei Beauftragung zu 100 % verrechnet.
              </div>
            </div>
          </div>

          {/* Fallback AI Helper Button: "Nicht sicher, welche Ebene zutrifft? KI-Techniker fragen" */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() =>
                onOpenAiChat(
                  `Ich bin mir nicht sicher, welche Schadensebene bei meinem ${CATEGORY_LABELS[currentCategory].label} zutrifft. Mein Problem ist: `
                )
              }
              className="w-full py-3.5 px-4 rounded-2xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-[#0C1A1D] via-[#102226] to-[#0C1A1D] border border-[#00F5D4]/40 hover:border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4]/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md group"
            >
              <Bot className="w-4 h-4 text-[#00F5D4] group-hover:scale-110 transition-transform" />
              <span>Nicht sicher, welche Ebene zutrifft? KI-Techniker fragen</span>
              <span className="text-zinc-500 font-normal hidden md:inline">
                (analysiert Schadsymptome in 5 Sekunden)
              </span>
            </button>
          </div>

          {/* Technical Disclosure Accordion */}
          <div className="border border-white/10 rounded-2xl bg-[#060B0D]/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="w-full px-5 py-4 flex items-center justify-between text-left font-mono text-xs text-[#00F5D4] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>🔧 Technische Details &amp; Labor-Ablauf anzeigen</span>
                <span className="text-[#839897] hidden sm:inline">(Mikrolöten &amp; Netto-Kalkulation)</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#839897] transition-transform duration-200 ${
                  showTechDetails ? 'rotate-180 text-[#00F5D4]' : ''
                }`}
              />
            </button>

            {showTechDetails && (
              <div className="p-5 border-t border-white/10 bg-[#040809] space-y-6 animate-fade-in">
                <div>
                  <h4 className="font-mono text-xs text-[#00F5D4] uppercase tracking-wider mb-3">
                    Durchgeführte Labor-Schritte unter dem 40x Stereomikroskop:
                  </h4>
                  <ul className="space-y-2">
                    {currentFault.steps.map((st, i) => (
                      <li key={i} className="text-xs sm:text-sm text-[#F3F7F7] flex items-start gap-2.5">
                        <span className="text-[#FF8D4D] font-bold font-mono">▸</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono text-xs text-[#FF8D4D] uppercase tracking-wider mb-2">
                    Kaufmännische Aufschlüsselung:
                  </h4>
                  <table className="w-full font-mono text-xs text-[#839897] border-collapse">
                    <tbody>
                      <tr className="border-b border-white/5 py-1.5">
                        <td className="py-1">Mikrolöt-Arbeitszeit / Labor:</td>
                        <td className="text-right text-white py-1">
                          ab {laborNet.toFixed(2).replace('.', ',')} €
                        </td>
                      </tr>
                      <tr className="border-b border-white/5 py-1.5">
                        <td className="py-1">Ersatzteil / OEM-Material:</td>
                        <td className="text-right text-white py-1">
                          ab {partsNet.toFixed(2).replace('.', ',')} €
                        </td>
                      </tr>
                      <tr className="border-b border-white/5 py-1.5">
                        <td className="py-1">Zwischensumme (Netto):</td>
                        <td className="text-right text-white py-1">
                          ab {subtotalNet.toFixed(2).replace('.', ',')} €
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">zzgl. 19 % gesetzliche MwSt.:</td>
                        <td className="text-right text-white py-1">
                          ab {taxNet.toFixed(2).replace('.', ',')} €
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
