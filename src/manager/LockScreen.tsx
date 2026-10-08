import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ShieldCheck, Clock, User as UserIcon, KeyRound, ChevronRight, AlertCircle } from 'lucide-react';
import { User } from './types';

interface LockScreenProps {
  isLocked: boolean;
  users: User[];
  onUnlock: (user: User) => void;
  onClose?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ isLocked, users, onUnlock, onClose }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isLocked) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (lockoutSeconds > 0) {
      setErrorMsg(`Sicherheitssperre aktiv: Bitte noch ${lockoutSeconds} Sekunden warten.`);
      return;
    }

    const cleanUser = username.trim().toLowerCase().slice(0, 50);
    const cleanPin = pin.trim().slice(0, 50);

    if (!cleanPin && !cleanUser) {
      setErrorMsg('Bitte Zugangsdaten eingeben.');
      return;
    }

    // Match by username/name and PIN
    const matched = users
      .filter((u) => u.active !== false)
      .find(
        (u) =>
          (u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser) &&
          u.pin === cleanPin
      );

    if (!matched) {
      const nextFail = failCount + 1;
      setFailCount(nextFail);
      if (nextFail >= 4) {
        setLockoutSeconds(30);
        setErrorMsg('Zu viele Fehlversuche! Zugriffsschutz: System für 30 Sekunden gesperrt.');
      } else {
        setErrorMsg(`Zugriff verweigert. (Verbleibende Versuche: ${4 - nextFail})`);
      }
      setPin('');
      return;
    }

    setFailCount(0);
    setErrorMsg(null);
    setPin('');
    setUsername('');
    onUnlock(matched);
  };

  return (
    <div className="fixed inset-0 bg-[#040809]/95 backdrop-blur-md z-[99999] flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="bg-[#0B1416] border-[1.5px] border-[#C9743F] rounded-2xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl shadow-black relative animate-in fade-in zoom-in-95">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Zurück zur Kundenansicht"
          >
            ✕
          </button>
        )}

        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#10191A] border border-[#C9743F]/50 flex items-center justify-center text-[#FF8D4D]">
          {lockoutSeconds > 0 ? (
            <ShieldAlert className="w-7 h-7 text-[#FF5252] animate-pulse" />
          ) : (
            <Lock className="w-7 h-7" />
          )}
        </div>

        <h2 className="font-mono text-xl font-black text-white tracking-wider mb-0.5">
          CODE <span className="text-[#FF8D4D]">// WERKSTATT</span>
        </h2>
        <p className="text-[11px] font-mono tracking-widest text-[#00F5D4] uppercase mb-6">
          // GESCHÜTZTER LOGIN &amp; ZUGRIFFSKONTROLLE
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Benutzername:
            </label>
            <div className="relative">
              <input
                type="text"
                disabled={lockoutSeconds > 0}
                autoComplete="username"
                value={username}
                autoFocus
                onChange={(e) => {
                  setErrorMsg(null);
                  setUsername(e.target.value);
                }}
                placeholder="Benutzername"
                className="w-full pl-10 pr-3 py-2.5 bg-[#020506] text-white border border-[#C9743F]/40 rounded-xl focus:border-[#00F5D4] focus:outline-none font-mono text-sm disabled:opacity-50"
              />
              <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono text-[#859B9E] uppercase">
                Kennwort / PIN:
              </label>
              {lockoutSeconds > 0 && (
                <span className="text-[10px] font-mono text-[#FF5252] flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3" />
                  Gesperrt: {lockoutSeconds}s
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                disabled={lockoutSeconds > 0}
                maxLength={30}
                autoComplete="current-password"
                value={pin}
                onChange={(e) => {
                  setErrorMsg(null);
                  setPin(e.target.value);
                }}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#020506] text-white border-2 border-[#00F5D4]/60 rounded-xl focus:border-[#00F5D4] focus:outline-none focus:ring-2 focus:ring-[#00F5D4]/20 transition-all font-mono text-base tracking-[3px] disabled:opacity-50"
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-950/40 border border-red-500/50 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={lockoutSeconds > 0}
            className="w-full py-3 px-4 rounded-xl font-mono font-bold text-sm uppercase bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all cursor-pointer shadow-lg shadow-[#00F5D4]/10 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Anmelden</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-white/5 text-[11px] font-mono text-[#859B9E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
          <span>Brute-Force-Schutz &amp; RBAC aktiv • Werkstatt Neumarkt</span>
        </div>
      </div>
    </div>
  );
};
