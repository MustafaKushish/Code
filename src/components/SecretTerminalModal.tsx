import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Terminal, Lock, Unlock, X, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

interface SecretTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const SecretTerminalModal: React.FC<SecretTerminalModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg(null);
      setIsSuccess(false);
      setIsVerifying(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPin = (inputPin = pin) => {
    const clean = inputPin.trim();
    if (!clean) return;

    setIsVerifying(true);
    setErrorMsg(null);

    // Workshop Master PIN is 2026
    if (clean === '2026' || clean.toLowerCase() === 'admin2026') {
      setIsSuccess(true);
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 700);
    } else {
      setTimeout(() => {
        setIsVerifying(false);
        setErrorMsg('ZUGRIFF VERWEIGERT // UNGÜLTIGER WORKSHOP-PIN');
        setPin('');
        inputRef.current?.focus();
      }, 400);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (isVerifying || isSuccess) return;
    if (val === 'CLEAR') {
      setPin('');
      setErrorMsg(null);
      return;
    }
    if (val === 'ENTER') {
      handleVerifyPin();
      return;
    }
    if (pin.length < 8) {
      const nextPin = pin + val;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin === '2026') {
        handleVerifyPin(nextPin);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#070D0E] border-2 border-[#00F5D4]/40 rounded-2xl w-full max-w-md shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden font-mono text-xs text-[#F3F7F7] relative">
        {/* Terminal Title Bar */}
        <div className="bg-[#0D181A] px-4 py-3 border-b border-[#00F5D4]/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#00F5D4] font-bold">
            <Terminal className="w-4 h-4 text-[#00F5D4]" />
            <span className="tracking-widest uppercase">CODE // SECURITY TERMINAL v2.6</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#839897] hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
            title="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Screen Body */}
        <div className="p-6 space-y-4">
          {/* Simulated boot logs */}
          <div className="space-y-1 text-[11px] text-[#4FA39B]/80 leading-tight">
            <p>&gt; WORKBENCH: STATION_01 // NEUMARKT I.D.OPF</p>
            <p>&gt; EDGE_CLUSTER: CLOUDFLARE_PAGES_ACTIVE</p>
            <p>&gt; AUTH_SERVICE: D1_SYNC_INITIALIZED</p>
            <p className="text-[#FF8D4D]">&gt; WORKSHOP MANAGER BACKDOOR ENGAGED.</p>
          </div>

          <div className="py-2 text-center">
            {isSuccess ? (
              <div className="py-4 space-y-2 animate-fade-in text-[#00F5D4]">
                <div className="w-12 h-12 rounded-full bg-[#00F5D4]/20 border border-[#00F5D4] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,245,212,0.4)]">
                  <CheckCircle className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-sm font-bold tracking-wider">[ZUGRIFF ERTEILT]</p>
                <p className="text-[11px] text-[#839897]">Lade Werkstatt-Manager...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#C9743F]/20 border border-[#C9743F]/50 flex items-center justify-center text-[#FF8D4D] mx-auto mb-3 shadow-[0_0_15px_rgba(201,116,63,0.3)]">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-[10px] uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>INTERNE WERKSTATT-AUTH</span>
                </div>

                <p className="text-[#839897] text-[11px] mb-4">
                  Bitte PIN für die Freischaltung des Werkstatt-Managers eingeben:
                </p>

                {/* Hidden physical keyboard input */}
                <input
                  ref={inputRef}
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPin(next);
                    if (next === '2026') {
                      handleVerifyPin(next);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyPin();
                    if (e.key === 'Escape') onClose();
                  }}
                  className="opacity-0 absolute -z-10"
                />

                {/* Glowing PIN Display Slots */}
                <div
                  onClick={() => inputRef.current?.focus()}
                  className="flex items-center justify-center gap-3 py-2 cursor-pointer"
                >
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = pin.length > idx;
                    return (
                      <div
                        key={idx}
                        className={`w-11 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all border ${
                          filled
                            ? 'bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.5)]'
                            : 'bg-[#050B0C] border-white/20 text-white/30'
                        }`}
                      >
                        {filled ? '•' : ''}
                      </div>
                    );
                  })}
                </div>

                {errorMsg && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center justify-center gap-1.5 animate-shake">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Touch/Mobile Numeric Keypad */}
                <div className="grid grid-cols-3 gap-2 mt-5 max-w-xs mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="py-2.5 rounded-lg bg-[#0F1B1D] border border-white/10 hover:border-[#00F5D4]/60 hover:bg-[#00F5D4]/15 active:scale-95 text-white font-bold text-sm transition cursor-pointer select-none"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('CLEAR')}
                    className="py-2.5 rounded-lg bg-[#1A1210] border border-red-500/30 hover:border-red-400 active:scale-95 text-red-400 font-bold text-xs uppercase transition cursor-pointer select-none"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2.5 rounded-lg bg-[#0F1B1D] border border-white/10 hover:border-[#00F5D4]/60 hover:bg-[#00F5D4]/15 active:scale-95 text-white font-bold text-sm transition cursor-pointer select-none"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('ENTER')}
                    disabled={isVerifying || !pin.trim()}
                    className="py-2.5 rounded-lg bg-[#00F5D4] text-[#060B0C] border border-[#00F5D4] active:scale-95 font-bold text-xs uppercase hover:bg-white transition cursor-pointer select-none disabled:opacity-40"
                  >
                    {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'OK'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#050A0B] px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#839897]">
          <span>MASTER PIN: 2026</span>
          <span className="flex items-center gap-1 text-[#00F5D4]">
            <Cpu className="w-3 h-3" />
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
