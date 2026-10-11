import React, { useMemo, useRef, useState } from 'react';
import { ArrowRight, Clock, Gamepad2, Joystick, KeyRound, Laptop, MessageSquare, Smartphone } from 'lucide-react';
import { DeviceCategoryKey, FaultItem } from '../types';
import { REPAIR_DATA } from '../data/repairData';
import { msg, useI18n } from '../i18n';
import { whatsappLink } from '../utils/whatsapp';

// Interaktives Gerät im Startbereich: Gerät wählen, auf die kaputte Stelle tippen,
// sofort Fehler, Preis ab, Dauer und Anfrage sehen. Preise kommen aus REPAIR_DATA.

type Spot = { x: number; y: number; fault: string; label: string };
type Device = {
  id: string;
  label: string;
  Icon: typeof Laptop;
  category: DeviceCategoryKey;
  spots: Spot[];
  Art: React.FC;
};

const PS5Art: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="ps5White" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f4f7f8" />
        <stop offset="0.6" stopColor="#dfe6e9" />
        <stop offset="1" stopColor="#b9c4c9" />
      </linearGradient>
      <linearGradient id="ps5Core" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b2226" />
        <stop offset="1" stopColor="#07090a" />
      </linearGradient>
    </defs>
    {/* schwarzer Kern */}
    <rect x="178" y="40" width="44" height="232" rx="10" fill="url(#ps5Core)" />
    <rect x="186" y="54" width="28" height="200" rx="6" fill="#0d1215" stroke="#00F5D4" strokeOpacity="0.35" />
    {/* weiße Flügel */}
    <path d="M178 46 C150 40 128 22 118 16 L112 280 C140 274 160 268 178 266 Z" fill="url(#ps5White)" />
    <path d="M222 46 C250 40 272 22 282 16 L288 280 C260 274 240 268 222 266 Z" fill="url(#ps5White)" />
    {/* Lichtleiste */}
    <path d="M178 46 C150 40 128 22 118 16" stroke="#4da3ff" strokeWidth="2.5" fill="none" opacity="0.9" />
    <path d="M222 46 C250 40 272 22 282 16" stroke="#4da3ff" strokeWidth="2.5" fill="none" opacity="0.9" />
    {/* Front: Laufwerk & Taste */}
    <rect x="194" y="226" width="12" height="3" rx="1.5" fill="#5f6b70" />
    <circle cx="200" cy="244" r="3" fill="#9aa6ab" />
    {/* HDMI hinten (angedeutet) */}
    <rect x="254" y="228" width="20" height="9" rx="2" fill="#0d1215" stroke="#9aa6ab" strokeWidth="1" />
  </g>
);

const MacBookArt: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="mbScreen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3a1c71" />
        <stop offset="0.5" stopColor="#d76d77" />
        <stop offset="1" stopColor="#ffaf7b" />
      </linearGradient>
      <linearGradient id="mbBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9d1d5" />
        <stop offset="1" stopColor="#8e999e" />
      </linearGradient>
    </defs>
    {/* Display */}
    <rect x="92" y="34" width="216" height="146" rx="10" fill="#1a1f22" />
    <rect x="100" y="42" width="200" height="128" rx="4" fill="url(#mbScreen)" />
    <rect x="186" y="42" width="28" height="6" rx="3" fill="#1a1f22" />
    {/* Unterteil */}
    <path d="M60 196 L340 196 L322 182 L78 182 Z" fill="url(#mbBody)" />
    <path d="M60 196 L340 196 L336 204 L64 204 Z" fill="#7d878c" />
    {/* Tastatur */}
    {[0, 1, 2, 3].map((r) => (
      <rect key={r} x={110 + r * 2} y={184 + r * 2.8} width={180 - r * 4} height="1.8" rx="0.9" fill="#3b4246" opacity="0.8" />
    ))}
    {/* USB-C links */}
    <rect x="64" y="197" width="9" height="3" rx="1.5" fill="#2b3134" />
  </g>
);

const ControllerArt: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="dsWhite" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6f8f9" />
        <stop offset="1" stopColor="#c3cdd1" />
      </linearGradient>
    </defs>
    {/* Griffe & Körper */}
    <path
      d="M120 90 C150 78 250 78 280 90 C320 104 352 190 340 236 C332 262 300 262 286 236 L266 196 L134 196 L114 236 C100 262 68 262 60 236 C48 190 80 104 120 90 Z"
      fill="url(#dsWhite)"
    />
    {/* schwarze Mitte */}
    <path d="M150 140 L250 140 L262 196 L138 196 Z" fill="#14191c" />
    {/* Touchpad */}
    <rect x="154" y="90" width="92" height="46" rx="10" fill="#e9eef0" stroke="#aab5ba" />
    {/* Lichtleiste */}
    <path d="M160 92 L240 92" stroke="#4da3ff" strokeWidth="2" opacity="0.8" />
    {/* Sticks */}
    <circle cx="164" cy="168" r="17" fill="#0b0f11" />
    <circle cx="164" cy="168" r="11" fill="#2a3135" />
    <circle cx="236" cy="168" r="17" fill="#0b0f11" />
    <circle cx="236" cy="168" r="11" fill="#2a3135" />
    {/* Steuerkreuz & Tasten */}
    <path d="M106 120 h10 v-10 h8 v10 h10 v8 h-10 v10 h-8 v-10 h-10 Z" fill="#9aa6ab" />
    {[
      [296, 108],
      [284, 120],
      [308, 120],
      [296, 132],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#9aa6ab" />
    ))}
  </g>
);

const PhoneArt: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="phScreen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0f4c75" />
        <stop offset="0.55" stopColor="#00b4a6" />
        <stop offset="1" stopColor="#ff8d4d" />
      </linearGradient>
    </defs>
    <rect x="148" y="20" width="104" height="262" rx="22" fill="#20272b" stroke="#6f7c82" strokeWidth="2" />
    <rect x="155" y="27" width="90" height="248" rx="16" fill="url(#phScreen)" />
    <rect x="182" y="34" width="36" height="10" rx="5" fill="#0b0f11" />
    {/* App-Raster */}
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2].map((c) => (
        <rect key={`${r}-${c}`} x={166 + c * 26} y={64 + r * 30} width="16" height="16" rx="5" fill="#ffffff" opacity="0.22" />
      ))
    )}
    <rect x="186" y="262" width="28" height="3" rx="1.5" fill="#ffffff" opacity="0.6" />
    {/* Ladebuchse */}
    <rect x="190" y="280" width="20" height="4" rx="2" fill="#0b0f11" />
  </g>
);

const KeyArt: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="keyBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2c3438" />
        <stop offset="1" stopColor="#0d1113" />
      </linearGradient>
      <linearGradient id="keyBlade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#e3e8ea" />
        <stop offset="1" stopColor="#8e999e" />
      </linearGradient>
    </defs>
    {/* Schlüsselbart */}
    <path d="M232 140 L352 140 L352 150 L340 156 L330 150 L318 158 L306 150 L294 156 L282 150 L270 156 L232 156 Z" fill="url(#keyBlade)" />
    {/* Gehäuse */}
    <rect x="70" y="74" width="170" height="150" rx="56" fill="url(#keyBody)" stroke="#4b565b" strokeWidth="2" />
    <circle cx="100" cy="149" r="10" fill="#060b0c" stroke="#4b565b" strokeWidth="2" />
    {/* Tasten */}
    {[104, 149, 194].map((y, i) => (
      <g key={y}>
        <rect x="140" y={y - 15} width="70" height="30" rx="15" fill="#1b2226" stroke="#4b565b" />
        <path
          d={i === 0 ? `M168 ${y} h14 M175 ${y - 6} v12` : i === 1 ? `M167 ${y + 4} l8 -8 l8 8` : `M167 ${y - 4} l8 8 l8 -8`}
          stroke="#cfd8dc"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    ))}
  </g>
);

const DEVICES: Device[] = [
  {
    id: 'ps5',
    label: 'PlayStation 5',
    Icon: Gamepad2,
    category: 'konsole',
    Art: PS5Art,
    spots: [
      { x: 264, y: 232, fault: 'ps5-hdmi', label: msg('HDMI-Port') },
      { x: 200, y: 110, fault: 'ps5-heat', label: msg('Kühlung') },
      { x: 200, y: 244, fault: 'console-bootloop', label: msg('Startet nicht') },
    ],
  },
  {
    id: 'macbook',
    label: 'MacBook',
    Icon: Laptop,
    category: 'laptop_pc',
    Art: MacBookArt,
    spots: [
      { x: 200, y: 106, fault: 'lp-display', label: msg('Display') },
      { x: 200, y: 189, fault: 'lp-battery-keyboard', label: msg('Tastatur & Akku') },
      { x: 68, y: 199, fault: 'lp-usbc', label: msg('USB-C') },
      { x: 300, y: 189, fault: 'lp-water', label: msg('Wasserschaden') },
    ],
  },
  {
    id: 'controller',
    label: 'DualSense',
    Icon: Joystick,
    category: 'controller',
    Art: ControllerArt,
    spots: [
      { x: 164, y: 168, fault: 'hall-single', label: msg('Stick-Drift') },
      { x: 200, y: 113, fault: 'ctrl-firmware', label: msg('Firmware') },
      { x: 312, y: 222, fault: 'ctrl-battery', label: msg('Akku') },
    ],
  },
  {
    id: 'phone',
    label: 'Smartphone',
    Icon: Smartphone,
    category: 'phone',
    Art: PhoneArt,
    spots: [
      { x: 200, y: 120, fault: 'phone-display', label: msg('Display') },
      { x: 200, y: 200, fault: 'phone-battery', label: msg('Akku') },
      { x: 200, y: 282, fault: 'phone-port-clean', label: msg('Ladebuchse') },
    ],
  },
  {
    id: 'key',
    label: msg('Autoschlüssel'),
    Icon: KeyRound,
    category: 'schluessel',
    Art: KeyArt,
    spots: [
      { x: 175, y: 104, fault: 'key-switch', label: msg('Tasten') },
      { x: 100, y: 149, fault: 'key-battery', label: msg('Akku') },
      { x: 300, y: 148, fault: 'key-case', label: msg('Gehäuse & Bart') },
    ],
  },
];

const ALL_FAULTS: Record<string, FaultItem> = Object.fromEntries(
  Object.values(REPAIR_DATA)
    .flat()
    .map((f) => [f.id, f])
);

interface DeviceExplorerProps {
  onSelectCategory: (cat: DeviceCategoryKey) => void;
}

export const DeviceExplorer: React.FC<DeviceExplorerProps> = ({ onSelectCategory }) => {
  const { t } = useI18n();
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const [spotIndex, setSpotIndex] = useState(0);
  const [tilt, setTilt] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const device = DEVICES.find((d) => d.id === deviceId)!;
  const spot = device.spots[spotIndex] ?? device.spots[0];
  const fault = ALL_FAULTS[spot.fault];
  const price = useMemo(() => `${Math.round(fault.targetTotal)} €`, [fault]);

  const handleTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion.current || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - py) * 10, y: (px - 0.5) * 14, px: px * 100, py: py * 100 });
  };

  const Art = device.Art;

  return (
    <div className="glass rounded-[2rem] p-4 sm:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[15px] font-semibold text-white">{t('Wo ist dein Gerät kaputt?')}</p>
          <p className="text-xs text-zinc-400">{t('Tippe auf die leuchtende Stelle')}</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#00F5D4] bg-[#00F5D4]/10 border border-[#00F5D4]/25 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
          {t('Preis sofort')}
        </span>
      </div>

      {/* Geräteauswahl */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]" role="tablist">
        {DEVICES.map((d) => {
          const active = d.id === deviceId;
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setDeviceId(d.id);
                setSpotIndex(0);
              }}
              className={`shrink-0 h-10 px-3.5 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#00F5D4]/20 to-[#FF8D4D]/20 border-[#00F5D4]/60 text-white shadow-[0_8px_24px_rgba(0,245,212,0.18)]'
                  : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:border-white/25 hover:text-white'
              }`}
            >
              <d.Icon className={`w-4 h-4 ${active ? 'text-[#00F5D4]' : ''}`} />
              {t(d.label)}
            </button>
          );
        })}
      </div>

      {/* Bühne mit Gerät */}
      <div className="board-stage relative mt-3" onPointerMove={handleTilt} onPointerLeave={() => setTilt(null)}>
        <div
          className={`board-3d device-stage relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 ${tilt ? '' : 'board-idle'}`}
          style={tilt ? { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } : undefined}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
            style={{
              background: `radial-gradient(500px circle at ${tilt?.px ?? 30}% ${tilt?.py ?? 0}%, rgba(255,255,255,0.12), transparent 45%)`,
            }}
          />
          <svg key={device.id} viewBox="0 0 400 300" className="device-in relative w-full h-full" role="img" aria-label={t(device.label)}>
            <ellipse cx="200" cy="288" rx="150" ry="10" fill="#000" opacity="0.45" />
            <Art />
            {device.spots.map((s, i) => {
              const active = i === spotIndex;
              return (
                <g
                  key={s.fault}
                  role="button"
                  tabIndex={0}
                  aria-label={t(s.label)}
                  aria-pressed={active}
                  className="cursor-pointer focus:outline-none"
                  onClick={() => setSpotIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSpotIndex(i);
                    }
                  }}
                >
                  <circle cx={s.x} cy={s.y} r="18" fill="transparent" />
                  <circle cx={s.x} cy={s.y} r="12" className="spot-ring" fill="none" stroke={active ? '#FF8D4D' : '#00F5D4'} strokeWidth="2" />
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={active ? 7 : 5.5}
                    fill={active ? '#FF8D4D' : '#00F5D4'}
                    stroke="#04110F"
                    strokeWidth="2"
                    style={{ filter: `drop-shadow(0 0 6px ${active ? '#FF8D4D' : '#00F5D4'})` }}
                  />
                </g>
              );
            })}
          </svg>
          {/* Beschriftung der aktiven Stelle */}
          <div className="absolute top-3 start-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur px-3 py-1 text-[11px] text-white border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8D4D]" />
            {t(spot.label)}
          </div>
        </div>
        <div aria-hidden="true" className="mx-auto -mt-1 h-6 w-[80%] rounded-[50%] bg-black/60 blur-xl" />
      </div>

      {/* Ergebnis-Karte */}
      <div key={fault.id} className="node-pop relative z-10 -mt-8 mx-1 sm:mx-5 glass glass-solid rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-white leading-snug">{t(fault.title)}</p>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">{t(fault.desc)}</p>
          </div>
          <p className="shrink-0 text-end">
            <span className="block text-[10px] text-zinc-400">{t('ab')}</span>
            <span className="block text-2xl font-bold text-[#FFB98A]" dir="ltr">{price}</span>
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-[#00F5D4]" />
            {t(fault.time)}
          </span>
          <div className="flex gap-2 ms-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSelectCategory(device.category)}
              className="flex-1 sm:flex-none whitespace-nowrap inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold text-white bg-white/[0.05] border border-white/15 hover:border-[#00F5D4]/60 transition-colors cursor-pointer"
            >
              {t('Alle Preise')}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
            <a
              href={whatsappLink(
                t('Hallo Mustafa, ich habe ein Problem mit meinem Gerät: {device} – {fault}. Was kostet die Reparatur?', {
                  device: t(device.label),
                  fault: t(fault.title),
                })
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none whitespace-nowrap inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-semibold bg-[#25D366] text-[#04140A] hover:brightness-110 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {t('Anfragen')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
