import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Terminal, Lock, X, RefreshCw, Cpu, CheckCircle } from 'lucide-react';
import { verifyAdminKey, setAdminKey } from '../services/cloudflareSync';

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

  const handleVerifyKey = async () => {
    const clean = pin.trim();
    if (!clean || isVerifying) return;

    setIsVerifying(true);
    setErrorMsg(null);

    // Der Schlüssel wird ausschließlich vom Worker geprüft – im Website-Code steht keiner.
    const result = await verifyAdminKey(clean);
    if (result === 'ok') {
      setAdminKey(clean);
      setIsSuccess(true);
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 700);
      return;
    }

    setIsVerifying(false);
    setPin('');
    setErrorMsg(
      result === 'locked'
        ? 'ZU VIELE FEHLVERSUCHE // ZUGANG 15 MINUTEN GESPERRT'
        : result === 'offline'
        ? 'SERVER NICHT ERREICHBAR // BITTE SPÄTER ERNEUT VERSUCHEN'
        : 'ZUGRIFF VERWEIGERT // UNGÜLTIGER WERKSTATT-SCHLÜSSEL'
    );
    inputRef.current?.focus();
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
                  Bitte Werkstatt-Schlüssel für die Freischaltung des Werkstatt-Managers eingeben:
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyKey();
                  }}
                  className="flex gap-2 max-w-xs mx-auto"
                >
                  <input
                    ref={inputRef}
                    type="password"
                    autoComplete="current-password"
                    aria-label="Werkstatt-Schlüssel"
                    placeholder="Werkstatt-Schlüssel"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErrorMsg(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') onClose();
                    }}
                    disabled={isVerifying}
                    className="flex-1 min-w-0 bg-[#050B0C] border border-white/20 focus:border-[#00F5D4] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying || !pin.trim()}
                    className="px-4 rounded-xl bg-[#00F5D4] text-[#060B0C] font-bold text-xs uppercase hover:bg-white transition cursor-pointer disabled:opacity-40"
                  >
                    {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'OK'}
                  </button>
                </form>

                {errorMsg && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center justify-center gap-1.5 animate-shake">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#050A0B] px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#839897]">
          <span>SERVERSEITIG GEPRÜFT</span>
          <span className="flex items-center gap-1 text-[#00F5D4]">
            <Cpu className="w-3 h-3" />
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
