import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  Clock,
  User as UserIcon,
  KeyRound,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { User } from './types';
import { verifyPin, MIN_PIN_LENGTH } from './pinAuth';
import { verifyAdminKey, adminKeyErrorText } from '../services/cloudflareSync';

interface LockScreenProps {
  isLocked: boolean;
  users: User[];
  onUnlock: (user: User) => void;
  /** Setzt die PIN eines Kontos neu (nach Prüfung des Werkstatt-Schlüssels) */
  onResetPin: (userId: string, newPin: string) => Promise<void>;
  onClose?: () => void;
}

type Mode = 'login' | 'forgot-key' | 'forgot-pin' | 'forgot-done';

const inputClass =
  'w-full pl-10 pr-3 py-3 bg-[#020506] text-white border border-[#C9743F]/40 rounded-xl focus:border-[#00F5D4] focus:outline-none font-mono text-base disabled:opacity-50';

export const LockScreen: React.FC<LockScreenProps> = ({ isLocked, users, onUnlock, onResetPin, onClose }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

  // „PIN vergessen“
  const [workshopKey, setWorkshopKey] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isLocked) return null;

  const activeUsers = users.filter((u) => u.active !== false);

  const switchMode = (next: Mode) => {
    setErrorMsg(null);
    setMode(next);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (busy) return;

    if (lockoutSeconds > 0) {
      setErrorMsg(`Sicherheitssperre aktiv: Bitte noch ${lockoutSeconds} Sekunden warten.`);
      return;
    }

    const cleanUser = username.trim().toLowerCase().slice(0, 50);
    const cleanPin = pin.trim().slice(0, 50);

    if (!cleanPin || !cleanUser) {
      setErrorMsg('Bitte Benutzername und PIN eingeben.');
      return;
    }

    setBusy(true);
    const candidates = activeUsers.filter(
      (u) => u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser
    );
    let matched: User | undefined;
    for (const u of candidates) {
      if (await verifyPin(u, cleanPin)) {
        matched = u;
        break;
      }
    }
    setBusy(false);

    if (!matched) {
      const nextFail = failCount + 1;
      setFailCount(nextFail);
      if (nextFail >= 4) {
        setLockoutSeconds(30);
        setFailCount(0);
        setErrorMsg('Zu viele Fehlversuche. Anmeldung für 30 Sekunden gesperrt.');
      } else {
        setErrorMsg(`Benutzername oder PIN falsch. (Noch ${4 - nextFail} Versuche)`);
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

  const handleCheckKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopKey.trim()) {
      setErrorMsg('Bitte den Werkstatt-Schlüssel eingeben.');
      return;
    }
    setBusy(true);
    const result = await verifyAdminKey(workshopKey.trim());
    setBusy(false);
    if (result === 'ok') {
      const firstAdmin = activeUsers.find((u) => u.role === 'admin') || activeUsers[0];
      setResetUserId(firstAdmin?.id || '');
      setWorkshopKey('');
      switchMode('forgot-pin');
    } else {
      setErrorMsg(adminKeyErrorText(result));
    }
  };

  const handleSetNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = users.find((u) => u.id === resetUserId);
    if (!target) {
      setErrorMsg('Bitte ein Konto auswählen.');
      return;
    }
    if (newPin.trim().length < MIN_PIN_LENGTH) {
      setErrorMsg(`Die PIN braucht mindestens ${MIN_PIN_LENGTH} Zeichen.`);
      return;
    }
    if (newPin.trim() !== newPin2.trim()) {
      setErrorMsg('Die beiden PINs stimmen nicht überein.');
      return;
    }
    setBusy(true);
    await onResetPin(target.id, newPin.trim());
    setBusy(false);
    setNewPin('');
    setNewPin2('');
    setUsername(target.username);
    setFailCount(0);
    setLockoutSeconds(0);
    switchMode('forgot-done');
  };

  const resetTarget = users.find((u) => u.id === resetUserId);

  return (
    <div className="fixed inset-0 bg-[#040809]/95 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0B1416] border-[1.5px] border-[#C9743F] rounded-2xl p-5 sm:p-8 w-full max-w-md text-center shadow-2xl shadow-black relative my-auto animate-in fade-in zoom-in-95">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center text-[#859B9E] hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Zurück zur Kundenansicht"
            aria-label="Zurück zur Kundenansicht"
          >
            ✕
          </button>
        )}

        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#10191A] border border-[#C9743F]/50 flex items-center justify-center text-[#FF8D4D]">
          {lockoutSeconds > 0 ? (
            <ShieldAlert className="w-7 h-7 text-[#FF5252] animate-pulse" />
          ) : mode === 'login' ? (
            <Lock className="w-7 h-7" />
          ) : (
            <KeyRound className="w-7 h-7" />
          )}
        </div>

        <h2 className="font-mono text-xl font-black text-white tracking-wider mb-0.5">
          CODE <span className="text-[#FF8D4D]">// WERKSTATT</span>
        </h2>
        <p className="text-[11px] font-mono tracking-widest text-[#00F5D4] uppercase mb-6">
          {mode === 'login' ? '// Mitarbeiter-Anmeldung' : '// PIN zurücksetzen'}
        </p>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label htmlFor="lock-user" className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Benutzername
              </label>
              <div className="relative">
                <input
                  id="lock-user"
                  type="text"
                  disabled={lockoutSeconds > 0}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  autoFocus
                  onChange={(e) => {
                    setErrorMsg(null);
                    setUsername(e.target.value);
                  }}
                  placeholder="z. B. admin"
                  className={inputClass}
                />
                <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="lock-pin" className="text-[11px] font-mono text-[#859B9E] uppercase">
                  PIN
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
                  id="lock-pin"
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
                  className={`${inputClass} border-2 border-[#00F5D4]/60 tracking-[3px]`}
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMsg && <ErrorBox text={errorMsg} />}

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || busy}
              className="w-full py-3 px-4 rounded-xl font-mono font-bold text-sm uppercase bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all cursor-pointer shadow-lg shadow-[#00F5D4]/10 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Anmelden</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => switchMode('forgot-key')}
              className="w-full py-2.5 text-xs font-mono text-[#859B9E] hover:text-[#00F5D4] underline underline-offset-4 cursor-pointer"
            >
              PIN vergessen?
            </button>
          </form>
        )}

        {mode === 'forgot-key' && (
          <form onSubmit={handleCheckKey} className="space-y-4 text-left">
            <p className="text-xs font-mono text-[#94A9AA] leading-relaxed">
              Gib den Werkstatt-Schlüssel ein. Das ist der lange Schlüssel aus Cloudflare (<code>ADMIN_KEY</code>), mit dem
              du den Manager auf diesem Gerät freigeschaltet hast. Danach kannst du eine neue PIN festlegen.
            </p>
            <div>
              <label htmlFor="lock-key" className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Werkstatt-Schlüssel
              </label>
              <div className="relative">
                <input
                  id="lock-key"
                  type="password"
                  autoComplete="off"
                  autoFocus
                  value={workshopKey}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setWorkshopKey(e.target.value);
                  }}
                  className={inputClass}
                />
                <ShieldCheck className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMsg && <ErrorBox text={errorMsg} />}

            <PrimaryButton busy={busy} label="Schlüssel prüfen" />
            <BackButton onClick={() => switchMode('login')} />
          </form>
        )}

        {mode === 'forgot-pin' && (
          <form onSubmit={handleSetNewPin} className="space-y-4 text-left">
            <div>
              <label htmlFor="reset-user" className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Konto
              </label>
              <select
                id="reset-user"
                value={resetUserId}
                onChange={(e) => setResetUserId(e.target.value)}
                className="w-full px-3 py-3 bg-[#020506] text-white border border-[#C9743F]/40 rounded-xl focus:border-[#00F5D4] focus:outline-none font-mono text-base"
              >
                {activeUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.username}, {u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reset-pin" className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Neue PIN (mind. {MIN_PIN_LENGTH} Zeichen)
              </label>
              <div className="relative">
                <input
                  id="reset-pin"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  value={newPin}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setNewPin(e.target.value);
                  }}
                  className={`${inputClass} tracking-[3px]`}
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label htmlFor="reset-pin2" className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                Neue PIN wiederholen
              </label>
              <div className="relative">
                <input
                  id="reset-pin2"
                  type="password"
                  autoComplete="new-password"
                  value={newPin2}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setNewPin2(e.target.value);
                  }}
                  className={`${inputClass} tracking-[3px]`}
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMsg && <ErrorBox text={errorMsg} />}

            <PrimaryButton busy={busy} label="PIN speichern" />
            <BackButton onClick={() => switchMode('login')} />
          </form>
        )}

        {mode === 'forgot-done' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/40 text-left text-xs font-mono text-[#B9F6CA]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#00E676]" />
              <span>
                Neue PIN gespeichert{resetTarget ? ` für ${resetTarget.name}` : ''}. Sie gilt auf allen Werkstatt-Geräten.
                Melde dich jetzt mit Benutzername <strong>{resetTarget?.username}</strong> an.
              </span>
            </div>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full py-3 px-4 rounded-xl font-mono font-bold text-sm uppercase bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Zur Anmeldung</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-white/5 text-[11px] font-mono text-[#859B9E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
          <span>PINs verschlüsselt gespeichert • Werkstatt Neumarkt</span>
        </div>
      </div>
    </div>
  );
};

const ErrorBox: React.FC<{ text: string }> = ({ text }) => (
  <div role="alert" className="flex items-center gap-1.5 p-2 rounded-lg bg-red-950/40 border border-red-500/50 text-red-400 text-xs font-mono">
    <AlertCircle className="w-4 h-4 shrink-0" />
    <span>{text}</span>
  </div>
);

const PrimaryButton: React.FC<{ busy: boolean; label: string }> = ({ busy, label }) => (
  <button
    type="submit"
    disabled={busy}
    className="w-full py-3 px-4 rounded-xl font-mono font-bold text-sm uppercase bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
    <span>{label}</span>
    <ChevronRight className="w-4 h-4" />
  </button>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-2.5 text-xs font-mono text-[#859B9E] hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
  >
    <ArrowLeft className="w-3.5 h-3.5" />
    <span>Zurück zur Anmeldung</span>
  </button>
);
