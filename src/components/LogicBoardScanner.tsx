import React, { useState, useEffect } from 'react';
import { Microscope, Flame, Activity, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playMultimeterBeep, playThermalToggleSound, toggleSound, isSoundEnabled } from '../utils/audio';
import { msg, useI18n } from '../i18n';

interface PinNode {
  name: string;
  voltage: string;
  desc: string;
  status: 'OK' | 'SHORT' | 'WARM';
  temp?: string;
}

const BOARD_MODES = [
  { id: 'key', label: msg('Autoschlüssel-Elektronik'), icon: '🔑' },
  { id: 'ps5', label: 'PS5 Motherboard', icon: '🎮' },
  { id: 'macbook', label: 'MacBook Logic-Board', icon: '💻' },
  { id: 'controller', label: 'DualSense Hall-Sensor', icon: '🕹️' },
];

const TICKER_MESSAGES = [
  msg('Labor Neumarkt: HF-Frequenzzähler 433.92 MHz aktiv • 3.02V Versorgungsspannung stabil'),
  msg('Messung: TP_VBAT 3.02V • Ruhestrom < 1.2 µA • Panasonic VL2020 Zelle voll geladen'),
  msg('Transponder-Spule 125 kHz: Wegfahrsperren-Induktion fehlerfrei erkannt'),
  msg('Mikrotaster 1-3: Klickmechanik & Kontaktwiderstand 0.04 Ω perfekt'),
  msg('Tippe auf Taster, Transponder-Spule, Akku oder Testpunkte für Live-Messwerte'),
];

export const LogicBoardScanner: React.FC = () => {
  const { t } = useI18n();
  const [activeBoard, setActiveBoard] = useState('key');
  const [thermalMode, setThermalMode] = useState(false);
  const [probeMode, setProbeMode] = useState<'VOLT' | 'DIODE' | 'RESIST'>('VOLT');
  const [selectedNode, setSelectedNode] = useState<PinNode>({
    name: 'NXP MCU (PCF7945 / AES)',
    voltage: '3.02V VCC',
    desc: msg('Rolling-Code Generator & HF-Modulator aktiv. Krypto-Handshake zum Auto verifiziert.'),
    status: 'OK',
    temp: '26.8 °C',
  });
  // Lauftext: entweder eine der festen Meldungen (Index) oder eine Messung als fertiger Text
  const [tickerText, setTickerText] = useState<string>(TICKER_MESSAGES[0]);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % TICKER_MESSAGES.length;
      setTickerText(TICKER_MESSAGES[i]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleInspect = (node: PinNode) => {
    playMultimeterBeep();
    setSelectedNode(node);
    let measureValue = t(node.voltage);
    if (probeMode === 'DIODE') measureValue = t('Dioden-Wert: 0.442V (OK)');
    if (probeMode === 'RESIST') measureValue = node.status === 'SHORT' ? t('Widerstand: 0.2 Ω (KURZSCHLUSS)') : t('Widerstand: > 120 kΩ');
    setTickerText(t('Messpunkt [{name}]: {value} • {desc}', { name: t(node.name), value: measureValue, desc: t(node.desc) }));
  };

  const inspectKeyNode = (
    desc: string,
    name: string,
    voltage: string,
    status: 'OK' | 'SHORT' | 'WARM' = 'OK',
    temp = '24.5 °C'
  ) => {
    handleInspect({
      name,
      voltage,
      desc,
      status,
      temp,
    });
  };

  const handleThermalToggle = () => {
    playThermalToggleSound();
    setThermalMode(!thermalMode);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <div className="bg-[#0B1416]/95 border border-[#C9743F]/35 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Embedded CSS for SVG animations */}
      <style>{`
        @keyframes electronFlow {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes rfBroadcast {
          0% { opacity: 0.3; stroke: #4FA39B; }
          50% { opacity: 1; stroke: #00F5D4; filter: drop-shadow(0 0 6px #00F5D4); }
          100% { opacity: 0.3; stroke: #4FA39B; }
        }
        @keyframes ledBlink {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 8px #FF8D4D); }
        }
        .live-trace-pwr {
          stroke-dasharray: 6, 4;
          animation: electronFlow 1.2s linear infinite;
        }
        .live-trace-data {
          stroke-dasharray: 4, 3;
          animation: electronFlow 0.8s linear infinite reverse;
        }
        .live-rf-antenna {
          animation: rfBroadcast 2s ease-in-out infinite;
        }
        .live-diag-led {
          transform-origin: 40px 115px;
          animation: ledBlink 1.8s ease-in-out infinite;
          cursor: pointer;
        }
        .key-btn-pad {
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .key-btn-pad:hover {
          filter: drop-shadow(0 0 8px #00F5D4);
        }
        .key-btn-pad:active {
          transform: translateY(1px);
        }
        .clickable-chip {
          cursor: pointer;
          transition: filter 0.15s ease;
        }
        .clickable-chip:hover {
          filter: drop-shadow(0 0 8px #FF8D4D);
        }
        .clickable-pin {
          cursor: pointer;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .clickable-pin:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 0 6px #00F5D4);
        }
      `}</style>

      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C9743F]/20 pb-3 mb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00F5D4] tracking-wider uppercase">
          <Microscope className="w-4 h-4 text-[#00F5D4]" />
          <span>&gt; {t('INTERAKTIVER LOGIC-BOARD INSPEKTOR')}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={handleSoundToggle}
            className={`p-1.5 rounded border transition-colors cursor-pointer ${
              soundOn
                ? 'bg-[#122225] border-[#4FA39B]/40 text-[#00F5D4]'
                : 'bg-black/40 border-white/10 text-[#839897]'
            }`}
            title={soundOn ? t('Soundeffekte aktiv') : t('Stummgeschaltet')}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* FLIR Thermal Toggle */}
          <button
            type="button"
            onClick={handleThermalToggle}
            className={`px-3 py-1 text-xs font-mono rounded border flex items-center gap-1.5 transition-all cursor-pointer ${
              thermalMode
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'bg-[#122225] border-[#4FA39B]/30 text-[#839897] hover:text-[#F3F7F7]'
            }`}
            title={t('Wärmebild-Simulation umschalten (Kurzschluss-Suche)')}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{thermalMode ? t('FLIR: AKTIV') : t('Wärmebild')}</span>
          </button>

          {/* Multimeter Mode Selector */}
          <div className="hidden sm:flex items-center bg-[#070E10] border border-[#C9743F]/30 rounded p-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setProbeMode('VOLT')}
              className={`px-2 py-0.5 rounded cursor-pointer ${probeMode === 'VOLT' ? 'bg-[#00F5D4] text-[#060B0C] font-bold' : 'text-[#839897]'}`}
            >
              Volt (V)
            </button>
            <button
              type="button"
              onClick={() => setProbeMode('DIODE')}
              className={`px-2 py-0.5 rounded cursor-pointer ${probeMode === 'DIODE' ? 'bg-[#00F5D4] text-[#060B0C] font-bold' : 'text-[#839897]'}`}
            >
              Diode
            </button>
            <button
              type="button"
              onClick={() => setProbeMode('RESIST')}
              className={`px-2 py-0.5 rounded cursor-pointer ${probeMode === 'RESIST' ? 'bg-[#00F5D4] text-[#060B0C] font-bold' : 'text-[#839897]'}`}
            >
              Ohm (Ω)
            </button>
          </div>
        </div>
      </div>

      {/* Board Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {BOARD_MODES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setActiveBoard(b.id);
              if (b.id === 'key') {
                inspectKeyNode(
                  msg('Rolling-Code Generator & HF-Modulator aktiv. Krypto-Handshake zum Auto verifiziert.'),
                  'NXP MCU (PCF7945 / AES)',
                  '3.02V VCC',
                  'OK',
                  '26.8 °C'
                );
              } else if (b.id === 'ps5') {
                handleInspect({
                  name: 'PS5 HDMI 2.1 & Retimer IC',
                  voltage: '5.02V',
                  desc: msg('19 Pins geprüft. Keine verbogenen Kontakte mehr.'),
                  status: 'OK',
                  temp: '38.2 °C',
                });
              } else if (b.id === 'macbook') {
                handleInspect({
                  name: 'MacBook 19.5V VDD_MAIN Rail',
                  voltage: '19.54V',
                  desc: msg('Sperrkondensator C7050 getauscht. Kein Kurzschluss mehr nach Masse.'),
                  status: 'OK',
                  temp: '41.0 °C',
                });
              } else {
                handleInspect({
                  name: 'DualSense FavocTech Hall-Sensor',
                  voltage: '3.30V',
                  desc: msg('Magnetfeld-Sensor zentriert (Fehlerquote 0.02%). Kein Schleifkontakt!'),
                  status: 'OK',
                  temp: '28.1 °C',
                });
              }
            }}
            className={`py-2 px-2.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeBoard === b.id
                ? 'bg-[#C9743F]/25 border-[#FF8D4D] text-[#FFF] shadow-[0_0_12px_rgba(201,116,63,0.35)]'
                : 'bg-[#0E1A1C] border-[#C9743F]/20 text-[#839897] hover:border-[#4FA39B]/50 hover:text-white'
            }`}
          >
            <span>{b.icon}</span>
            <span dir="auto" className="truncate">{t(b.label)}</span>
          </button>
        ))}
      </div>

      {/* Logic Board Visual Container */}
      <div
        className={`logic-board-visual w-full aspect-[16/10] rounded-xl relative overflow-hidden border transition-all duration-500 shadow-inner ${
          thermalMode
            ? 'bg-gradient-to-br from-[#120024] via-[#350228] to-[#040608] border-amber-500/50'
            : 'bg-[#060B0C] border-[#C9743F]/40'
        }`}
      >
        {/* Animated Laser Scanline */}
        <div className="scan-line absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-[#00F5D4]/20 to-transparent pointer-events-none z-10 animate-scan" aria-hidden="true" />

        {/* FLIR Thermal Hotspots Overlay */}
        {thermalMode && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-[28%] left-[24%] w-24 h-24 rounded-full bg-radial from-red-500/80 via-yellow-400/40 to-transparent blur-md animate-pulse" />
            <div className="absolute top-[35%] right-[28%] w-32 h-32 rounded-full bg-radial from-amber-500/60 via-purple-600/30 to-transparent blur-lg" />
            <div className="absolute bottom-3 left-4 font-mono text-[11px] text-amber-300 bg-black/80 px-2 py-1 rounded border border-amber-400/40">
              🔥 {t('FLIR HOTSPOT LOKALISIERT: +79.4 °C (SMD Kurzschluss C1_VCC behoben)')}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* AUTOSCHLÜSSEL SCHEMA (KEY FOB CIRCUIT BOARD) - ACTIVE BY DEFAULT */}
        {/* ========================================================================= */}
        {activeBoard === 'key' ? (
          <svg className="pcb-svg w-full h-full block select-none" viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Gold / Kupfer-Gradient für Lötpads */}
              <linearGradient id="padGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB37C" />
                <stop offset="50%" stopColor="#C9743F" />
                <stop offset="100%" stopColor="#80411B" />
              </linearGradient>

              {/* Silber-Gradient für Zinn & Quarz */}
              <linearGradient id="solderSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#B2C2C4" />
                <stop offset="100%" stopColor="#6F8588" />
              </linearGradient>

              {/* Hintergrund-Gitter */}
              <pattern id="keyGrid" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="0.6" fill="#132426" />
              </pattern>
            </defs>

            {/* 1. HINTERGRUND-RASTER */}
            <rect width="480" height="300" fill="#060B0C" />
            <rect width="480" height="300" fill="url(#keyGrid)" opacity="0.8" />

            {/* 2. AUTOSCHLÜSSEL-PLATINENKONTUR (Asymmetrische Gehäuseform) */}
            <path
              d="M 25 150 C 25 70, 70 25, 150 25 L 420 25 C 455 25, 465 50, 465 80 L 465 220 C 465 250, 455 275, 420 275 L 150 275 C 70 275, 25 230, 25 150 Z"
              fill="#0B1618"
              stroke="#1F3A3D"
              strokeWidth="2.5"
            />

            {/* Schlüsselring-Aussparung (Lanyard / Schlüsselbart-Halterung links) */}
            <circle cx="55" cy="150" r="14" fill="#060B0C" stroke="#C9743F" strokeWidth="2" />
            <circle cx="55" cy="150" r="18" fill="none" stroke="#1F3A3D" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* 3. HF-LOOP-ANTENNE AM PLATINENRAND (433.92 / 868 MHz) */}
            <path
              className="live-rf-antenna cursor-pointer"
              d="M 120 38 L 440 38 C 450 38, 452 45, 452 55 L 452 245 C 452 255, 450 262, 440 262 L 120 262"
              fill="none"
              stroke="#4FA39B"
              strokeWidth="3.5"
              strokeLinecap="round"
              onClick={() =>
                inspectKeyNode(
                  msg('Integrierte 433.92 MHz Loop-Antenne: Sendeleistung 10 mW, Reichweite bis 50m.'),
                  msg('HF-Loop Antenne (433.92 MHz)'),
                  msg('433.92 MHz HF-Träger'),
                  'OK',
                  '25.2 °C'
                )
              }
            />
            <text x="310" y="52" fontFamily="'IBM Plex Mono', monospace" fontSize="7" fill="#00F5D4" opacity="0.85">
              &gt;&gt;&gt; RF_LOOP_ANTENNA: 433.92 MHz [ACTIVE BROADCAST]
            </text>

            {/* 4. LEITERBAHNEN MIT LIVE-STROMFLUSS & DATENPULSEN */}
            {/* 3V Power Rail (Kupfer/Orange) */}
            <path d="M 370 150 L 320 150 L 320 120 L 255 120" fill="none" stroke="#C9743F" strokeWidth="2.5" opacity="0.4" />
            <path className="live-trace-pwr" d="M 370 150 L 320 150 L 320 120 L 255 120" fill="none" stroke="#FF8D4D" strokeWidth="2.5" />

            {/* Taster 1 Leitung (Lock) */}
            <path d="M 215 56 L 215 95" fill="none" stroke="#254F54" strokeWidth="2" />
            <path className="live-trace-data" d="M 215 56 L 215 95" fill="none" stroke="#00F5D4" strokeWidth="2" />

            {/* Taster 2 Leitung (Trunk) */}
            <path d="M 235 56 L 235 95" fill="none" stroke="#254F54" strokeWidth="2" />
            <path className="live-trace-data" d="M 235 56 L 235 95" fill="none" stroke="#00F5D4" strokeWidth="2" />

            {/* Taster 3 Leitung (Unlock) */}
            <path d="M 255 56 L 255 95" fill="none" stroke="#254F54" strokeWidth="2" />
            <path className="live-trace-data" d="M 255 56 L 255 95" fill="none" stroke="#00F5D4" strokeWidth="2" />

            {/* Transponder-Datenleitung zur Ferritspule */}
            <path className="live-trace-data" d="M 185 140 L 125 140 L 125 115 L 105 115" fill="none" stroke="#00F5D4" strokeWidth="1.8" />

            {/* 5. WICHTIGE BAUTEILE AUF DER PLATINE */}

            {/* A) IMMOBILIZER TRANSPONDER-SPULE (125 kHz Wegfahrsperren-Induktor) */}
            <g
              className="clickable-chip"
              onClick={() =>
                inspectKeyNode(
                  msg('Transponder-Spule (125 kHz): RFID-Induktion für Wegfahrsperre ohne Batteriestrom OK'),
                  msg('Transponder-Spule (125 kHz)'),
                  msg('125 kHz AC Induktion'),
                  'OK',
                  '23.8 °C'
                )
              }
            >
              {/* Ferritkern */}
              <rect x="75" y="105" width="30" height="18" rx="3" fill="#1C1815" stroke="#8A664B" strokeWidth="1.2" />
              {/* Kupferwicklungen */}
              <line x1="82" y1="105" x2="82" y2="123" stroke="#FF8D4D" strokeWidth="2.2" />
              <line x1="87" y1="105" x2="87" y2="123" stroke="#FF8D4D" strokeWidth="2.2" />
              <line x1="92" y1="105" x2="92" y2="123" stroke="#FF8D4D" strokeWidth="2.2" />
              <line x1="97" y1="105" x2="97" y2="123" stroke="#FF8D4D" strokeWidth="2.2" />
              <text x="90" y="134" fontFamily="'IBM Plex Mono', monospace" fontSize="6.5" fill="#C9743F" textAnchor="middle">
                RFID_COIL
              </text>
            </g>

            {/* B) DIAGNOSE- & SENDE-LED */}
            <g
              className="live-diag-led"
              onClick={() =>
                inspectKeyNode(
                  msg('SMD Sende-LED: Bestätigt Tastendruck mit HF-Paket-Bestätigung (Blink-Impuls)'),
                  msg('SMD Sende-LED'),
                  msg('2.10V Puls'),
                  'OK',
                  '26.4 °C'
                )
              }
            >
              <circle cx="40" cy="115" r="4.5" fill="#FF8D4D" stroke="#FFFFFF" strokeWidth="0.8" />
              <text x="40" y="105" fontFamily="'IBM Plex Mono', monospace" fontSize="6" fill="#FF8D4D" textAnchor="middle">
                LED
              </text>
            </g>

            {/* C) 3x SMD-MIKROTASTER (Obere Kante: Verriegeln, Kofferraum, Entriegeln) */}
            {/* Taste 1: Lock */}
            <g
              className="key-btn-pad"
              onClick={() =>
                inspectKeyNode(
                  msg('Mikrotaster 1 (LOCK): Übergangswiderstand 0.04 Ohm — Klickmechanik sauber & prellfrei'),
                  msg('Mikrotaster 1 (LOCK: ZU)'),
                  '3.02V Pullup',
                  'OK',
                  '22.9 °C'
                )
              }
            >
              <rect x="205" y="32" width="20" height="18" rx="2" fill="#121F21" stroke="#C9743F" strokeWidth="1" />
              <circle cx="215" cy="41" r="5" fill="#2E484C" stroke="#00F5D4" strokeWidth="1" />
              <rect x="202" y="36" width="3" height="4" fill="url(#solderSilver)" />
              <rect x="225" y="36" width="3" height="4" fill="url(#solderSilver)" />
              <text x="215" y="27" fontFamily="'IBM Plex Mono', monospace" fontSize="6.5" fill="#839897" textAnchor="middle">
                SW1:ZU
              </text>
            </g>

            {/* Taste 2: Kofferraum */}
            <g
              className="key-btn-pad"
              onClick={() =>
                inspectKeyNode(
                  msg('Mikrotaster 2 (TRUNK): SMD-Lötpads intakt — keine Leiterbahnrisse'),
                  msg('Mikrotaster 2 (TRUNK: HECK)'),
                  '3.02V Pullup',
                  'OK',
                  '23.1 °C'
                )
              }
            >
              <rect x="245" y="32" width="20" height="18" rx="2" fill="#121F21" stroke="#C9743F" strokeWidth="1" />
              <circle cx="255" cy="41" r="5" fill="#2E484C" stroke="#00F5D4" strokeWidth="1" />
              <rect x="242" y="36" width="3" height="4" fill="url(#solderSilver)" />
              <rect x="265" y="36" width="3" height="4" fill="url(#solderSilver)" />
              <text x="255" y="27" fontFamily="'IBM Plex Mono', monospace" fontSize="6.5" fill="#839897" textAnchor="middle">
                SW2:BOOT
              </text>
            </g>

            {/* Taste 3: Unlock */}
            <g
              className="key-btn-pad"
              onClick={() =>
                inspectKeyNode(
                  msg('Mikrotaster 3 (UNLOCK): Taster getauscht & mit bleifreiem Silberlot versiegelt'),
                  msg('Mikrotaster 3 (UNLOCK: AUF)'),
                  '3.02V Pullup',
                  'OK',
                  '23.0 °C'
                )
              }
            >
              <rect x="285" y="32" width="20" height="18" rx="2" fill="#121F21" stroke="#C9743F" strokeWidth="1" />
              <circle cx="295" cy="41" r="5" fill="#2E484C" stroke="#00F5D4" strokeWidth="1" />
              <rect x="282" y="36" width="3" height="4" fill="url(#solderSilver)" />
              <rect x="305" y="36" width="3" height="4" fill="url(#solderSilver)" />
              <text x="295" y="27" fontFamily="'IBM Plex Mono', monospace" fontSize="6.5" fill="#839897" textAnchor="middle">
                SW3:AUF
              </text>
            </g>

            {/* D) HAUPT-IC: NXP PCF79xx TRANSCEIVER / KEYLESS-MCU */}
            <g
              className="clickable-chip"
              onClick={() =>
                inspectKeyNode(
                  msg('NXP Transceiver-IC: Rolling-Code Generator & HF-Modulator aktiv. Krypto-Handshake verifiziert.'),
                  'NXP MCU (PCF7945 / AES)',
                  '3.02V VCC',
                  'OK',
                  '28.4 °C'
                )
              }
            >
              <rect x="185" y="105" width="70" height="55" rx="3" fill="#0C1416" stroke="#C9743F" strokeWidth="1.6" />
              {/* Pin-Indexpunkt */}
              <circle cx="193" cy="113" r="2" fill="#FF8D4D" />
              <text x="220" y="128" fontFamily="'IBM Plex Mono', monospace" fontSize="8.5" fontWeight="700" fill="#F3F7F7" textAnchor="middle">
                NXP-KEY
              </text>
              <text x="220" y="140" fontFamily="'IBM Plex Mono', monospace" fontSize="6" fill="#00F5D4" textAnchor="middle">
                PCF7945 / AES
              </text>

              {/* IC-Pins Oben */}
              <line x1="195" y1="105" x2="195" y2="99" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="205" y1="105" x2="205" y2="99" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="215" y1="105" x2="215" y2="99" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="225" y1="105" x2="225" y2="99" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="235" y1="105" x2="235" y2="99" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="245" y1="105" x2="245" y2="99" stroke="url(#solderSilver)" strokeWidth="2.5" />

              {/* IC-Pins Unten */}
              <line x1="195" y1="160" x2="195" y2="166" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="205" y1="160" x2="205" y2="166" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="215" y1="160" x2="215" y2="166" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="225" y1="160" x2="225" y2="166" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="235" y1="160" x2="235" y2="166" stroke="url(#solderSilver)" strokeWidth="2.5" />
              <line x1="245" y1="160" x2="245" y2="166" stroke="url(#solderSilver)" strokeWidth="2.5" />
            </g>

            {/* E) SCHWINGQUARZ / RESONATOR (13.56 MHz Metallgehäuse) */}
            <g
              className="clickable-chip"
              onClick={() =>
                inspectKeyNode(
                  msg('13.56 MHz Quarzresonator: Referenztakt für HF-Trägerfrequenz synchron (13.5600 MHz stabil)'),
                  msg('13.56 MHz Quarzresonator'),
                  msg('0.8V RMS Sinus'),
                  'OK',
                  '25.0 °C'
                )
              }
            >
              <rect x="185" y="190" width="34" height="22" rx="2" fill="url(#solderSilver)" stroke="#4A6568" strokeWidth="1" />
              <text x="202" y="204" fontFamily="'IBM Plex Mono', monospace" fontSize="6.5" fontWeight="700" fill="#060B0C" textAnchor="middle">
                13.56M
              </text>
              {/* Lötpads an den Ecken */}
              <rect x="182" y="191" width="3" height="5" fill="url(#padGold)" />
              <rect x="182" y="206" width="3" height="5" fill="url(#padGold)" />
              <rect x="219" y="191" width="3" height="5" fill="url(#padGold)" />
              <rect x="219" y="206" width="3" height="5" fill="url(#padGold)" />
            </g>

            {/* F) BATTERIE-HALTERUNG / VL2020 AKKU (Großer Kreis rechts) */}
            <g
              className="clickable-chip"
              onClick={() =>
                inspectKeyNode(
                  msg('Panasonic VL2020 Akku / CR2032 Halter: 3.02V Ruhespannung [VOLL] — Ladeelektronik über Zündschloss-Spule aktiv'),
                  msg('Panasonic VL2020 Akku (3V)'),
                  '3.02V DC',
                  'OK',
                  '24.1 °C'
                )
              }
            >
              <circle cx="370" cy="150" r="54" fill="#0E191B" stroke="#233B3E" strokeWidth="2" />
              <circle cx="370" cy="150" r="50" fill="none" stroke="#C9743F" strokeWidth="1.2" strokeDasharray="4,4" />

              {/* Akku-Kontaktfeder (Plus-Pol) */}
              <path d="M 335 125 C 360 105, 395 105, 410 125" fill="none" stroke="url(#padGold)" strokeWidth="4" strokeLinecap="round" />
              <rect x="365" y="145" width="10" height="10" fill="url(#padGold)" />
              <text x="370" y="175" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fontWeight="800" fill="#C9743F" textAnchor="middle">
                3.0V LI-ION
              </text>
              <text x="370" y="187" fontFamily="'IBM Plex Mono', monospace" fontSize="7" fill="#839897" textAnchor="middle">
                VL2020 / CR2032
              </text>
            </g>

            {/* G) TESTPUNKTE (Kupfer-Pads zum Messen mit Prüfspitzen) */}
            <circle
              cx="150"
              cy="80"
              r="4.5"
              fill="#152628"
              stroke="#00F5D4"
              strokeWidth="1.5"
              className="clickable-pin"
              onClick={() =>
                inspectKeyNode(
                  msg('Testpunkt TP_VBAT: 3.02 Volt gemessen — Batterieversorgung stabil unter Last'),
                  msg('Testpunkt TP_VBAT'),
                  '3.02V DC',
                  'OK',
                  '23.5 °C'
                )
              }
            />
            <text x="150" y="72" fontFamily="'IBM Plex Mono', monospace" fontSize="6" fill="#00F5D4" textAnchor="middle">
              TP_VBAT
            </text>

            <circle
              cx="150"
              cy="225"
              r="4.5"
              fill="#152628"
              stroke="#FF8D4D"
              strokeWidth="1.5"
              className="clickable-pin"
              onClick={() =>
                inspectKeyNode(
                  msg('Testpunkt TP_ANT: Spektrum 433.92 MHz sauber moduliert, kein Oszillationsfehler'),
                  msg('Testpunkt TP_RF_OUT'),
                  '433.92 MHz',
                  'OK',
                  '26.1 °C'
                )
              }
            />
            <text x="150" y="240" fontFamily="'IBM Plex Mono', monospace" fontSize="6" fill="#FF8D4D" textAnchor="middle">
              TP_RF_OUT
            </text>

            <circle
              cx="280"
              cy="225"
              r="4.5"
              fill="#152628"
              stroke="#C9743F"
              strokeWidth="1.5"
              className="clickable-pin"
              onClick={() =>
                inspectKeyNode(
                  msg('Testpunkt TP_GND: 0.00 Ohm Masseanbindung — kein Kriechstrom festgestellt'),
                  msg('Testpunkt TP_GND'),
                  '0.00V GND',
                  'OK',
                  '22.4 °C'
                )
              }
            />
            <text x="280" y="240" fontFamily="'IBM Plex Mono', monospace" fontSize="6" fill="#C9743F" textAnchor="middle">
              TP_GND
            </text>

            {/* SMD Entkopplungskondensatoren (Kompakte 0402/0603 Bauform) */}
            <g
              transform="translate(240, 185)"
              className="clickable-chip"
              onClick={() =>
                inspectKeyNode(
                  msg('SMD 0402 Pufferkondensator: Stabilisiert Spannungsspitzen beim Senden, ESR < 0.05 Ohm'),
                  msg('SMD 0402 Puffer-C'),
                  '3.02V DC',
                  'OK',
                  '24.0 °C'
                )
              }
            >
              <rect x="0" y="0" width="12" height="6" rx="1.5" fill="#5C4533" stroke="#8A664B" strokeWidth="0.8" />
              <rect x="0" y="0" width="3" height="6" fill="#B0BFC2" />
              <rect x="9" y="0" width="3" height="6" fill="#B0BFC2" />
            </g>
            <g
              transform="translate(260, 185)"
              className="clickable-chip"
              onClick={() =>
                inspectKeyNode(
                  msg('SMD HF-Filterinduktivität: Unterdrückt Oberwellen im 433-MHz Band, Gütefaktor Q=45'),
                  msg('HF-Filter (433 MHz)'),
                  msg('Filter aktiv'),
                  'OK',
                  '24.2 °C'
                )
              }
            >
              <rect x="0" y="0" width="12" height="6" rx="1.5" fill="#1E2B2D" stroke="#00F5D4" strokeWidth="0.8" />
              <rect x="0" y="0" width="3" height="6" fill="#B0BFC2" />
              <rect x="9" y="0" width="3" height="6" fill="#B0BFC2" />
            </g>
          </svg>
        ) : (
          /* ========================================================================= */
          /* ALTERNATIVE BOARDS (PS5, MACBOOK, CONTROLLER) */
          /* ========================================================================= */
          <svg className="w-full h-full block select-none" viewBox="0 0 460 280">
            <defs>
              <linearGradient id="silverPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E4EDEF" />
                <stop offset="50%" stopColor="#9EB2B5" />
                <stop offset="100%" stopColor="#546E71" />
              </linearGradient>
              <linearGradient id="copperTraceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D48842" />
                <stop offset="100%" stopColor="#FF9B54" />
              </linearGradient>
            </defs>

            {/* Background Grid */}
            <rect width="460" height="280" fill="#060C0E" />

            {/* Motherboard Outline */}
            <rect x="20" y="20" width="420" height="240" rx="14" fill="#0A1417" stroke="#16292C" strokeWidth="2" />

            {/* Traces */}
            <path d="M 40 80 L 120 80 L 150 110 L 220 110" fill="none" stroke="url(#copperTraceGrad)" strokeWidth="2.5" opacity="0.6" />
            <path d="M 220 170 L 150 170 L 120 200 L 40 200" fill="none" stroke="url(#copperTraceGrad)" strokeWidth="2.5" opacity="0.6" />
            <path d="M 320 80 L 380 80 L 400 100 L 400 180" fill="none" stroke="#00F5D4" strokeWidth="2" opacity="0.4" />
            <path d="M 300 210 L 360 210 L 380 190" fill="none" stroke="#FF8D4D" strokeWidth="2" opacity="0.4" />

            {/* Center Main BGA Chip */}
            <g
              className="clickable-chip"
              onClick={() =>
                handleInspect({
                  name: activeBoard === 'ps5' ? 'PS5 APU / Southbridge BGA' : activeBoard === 'macbook' ? 'Apple Silicon M-Series SoC' : 'DualSense MCU Master',
                  voltage: activeBoard === 'ps5' ? '0.92V Core' : '1.20V Core',
                  desc: msg('BGA-Reballing mit 0.45mm bleifreien Zinnkugeln. Keine gerissenen Lötperlen.'),
                  status: 'OK',
                  temp: '42.5 °C',
                })
              }
            >
              <rect x="180" y="90" width="100" height="100" rx="8" fill="#101C1F" stroke="#00F5D4" strokeWidth="1.8" />
              <circle cx="192" cy="102" r="3" fill="#FF8D4D" />
              <text x="230" y="135" fontFamily="'IBM Plex Mono', monospace" fontSize="12" fontWeight="800" fill="#FFFFFF" textAnchor="middle">
                {activeBoard === 'ps5' ? 'SONY APU' : activeBoard === 'macbook' ? 'APPLE SOC' : 'ARM MCU'}
              </text>
              <text x="230" y="152" fontFamily="'IBM Plex Mono', monospace" fontSize="8" fill="#00F5D4" textAnchor="middle">
                BGA-CHIP
              </text>
            </g>

            {/* Connector Port (Left) */}
            <g
              className="clickable-chip"
              onClick={() =>
                handleInspect({
                  name: activeBoard === 'ps5' ? 'PS5 HDMI 2.1 Interface' : 'USB-C Thunderbolt Port',
                  voltage: '5.02V VBUS',
                  desc: msg('Vergoldete Pins unter Stereomikroskop nachgelötet. Kein Wackelkontakt.'),
                  status: 'OK',
                  temp: '29.0 °C',
                })
              }
            >
              <rect x="25" y="105" width="45" height="70" rx="4" fill="#060C0E" stroke="#FF8D4D" strokeWidth="1.5" />
              <rect x="35" y="115" width="25" height="50" fill="url(#silverPinGrad)" />
              <text x="47" y="145" fontFamily="'IBM Plex Mono', monospace" fontSize="7" fill="#060C0E" fontWeight="700" textAnchor="middle">
                PORT
              </text>
            </g>

            {/* Test Pins (Right) */}
            <circle
              cx="350"
              cy="95"
              r="6"
              fill="#101C1F"
              stroke="#00F5D4"
              strokeWidth="2"
              className="clickable-pin"
              onClick={() =>
                handleInspect({
                  name: msg('Testpunkt TP_CLOCK'),
                  voltage: '3.30V Clock',
                  desc: msg('Taktgenerator fehlerfrei synchronisiert.'),
                  status: 'OK',
                  temp: '24.1 °C',
                })
              }
            />
            <circle
              cx="370"
              cy="185"
              r="6"
              fill="#101C1F"
              stroke="#FF8D4D"
              strokeWidth="2"
              className="clickable-pin"
              onClick={() =>
                handleInspect({
                  name: msg('Testpunkt TP_VDD_MAIN'),
                  voltage: '12.04V Power',
                  desc: msg('Hauptspannungsschiene stabil ohne Ripple.'),
                  status: 'OK',
                  temp: '31.2 °C',
                })
              }
            />
          </svg>
        )}
      </div>

      {/* Selected Node Details Box */}
      <div className="mt-4 bg-[#050B0D] border border-[#4FA39B]/35 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#00F5D4] font-bold">&gt; {t(selectedNode.name)}</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 font-bold">
              {t(selectedNode.voltage)}
            </span>
            {selectedNode.temp && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#FF8D4D]/15 text-[#FF8D4D] border border-[#FF8D4D]/40 font-bold">
                {selectedNode.temp}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40 font-bold">
              STATUS: {selectedNode.status}
            </span>
          </div>
          <p className="text-zinc-300 mt-1 text-[11px] leading-relaxed">{t(selectedNode.desc)}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
          <span className="text-[#839897] text-[10px]">{t('Tippe auf Taster, Spule oder Pins für Messwerte')}</span>
        </div>
      </div>

      {/* Terminal Live Marquee */}
      <div className="mt-2.5 bg-[#030607] border border-white/5 rounded-lg px-3 py-2 font-mono text-[11px] text-[#FF8D4D] flex items-center gap-2 overflow-hidden">
        <Activity className="w-3.5 h-3.5 text-[#00F5D4] shrink-0 animate-pulse" />
        <span className="truncate">&gt; {t(tickerText)}</span>
      </div>
    </div>
  );
};
