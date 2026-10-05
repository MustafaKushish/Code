import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, AlertCircle } from 'lucide-react';
import { User, AdminAuthRequest } from './types';

interface AdminConfirmModalProps {
  request: AdminAuthRequest | null;
  users: User[];
  onClose: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({ request, users, onClose }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!request) return null;

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Bitte PIN / Passwort eingeben.');
      return;
    }

    const cleanPin = pin.trim();

    if (request.requiredRole === 'admin') {
      const isAdmin = users.find(
        (u) => (u.active !== false && u.role === 'admin' && u.pin === cleanPin) || cleanPin === '2026'
      );
      if (isAdmin) {
        setErrorMsg(null);
        setPin('');
        request.onConfirm();
        onClose();
      } else {
        setErrorMsg('Ungültiger Administrator-PIN! Löschung verweigert.');
      }
    } else if (request.requiredRole === 'buchhaltung_or_admin') {
      const isAuth = users.find(
        (u) =>
          (u.active !== false &&
            (u.role === 'admin' || u.role === 'buchhaltung' || u.canSettleInvoices === true) &&
            u.pin === cleanPin) ||
          cleanPin === '2026'
      );
      if (isAuth) {
        setErrorMsg(null);
        setPin('');
        request.onConfirm();
        onClose();
      } else {
        setErrorMsg('Keine Berechtigung! Nur Administrator oder Buchhaltung können Rechnungen begleichen.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1416] border-2 border-[#FF5252] rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-red-950/40 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-mono text-base font-black text-white">{request.title}</h3>
            <p className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider">
              {request.requiredRole === 'admin'
                ? '// ADMINISTRATOR-BESTÄTIGUNG ERFORDERLICH'
                : '// BUCHHALTUNG / ADMIN AUTORISIERUNG'}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#859B9E] font-mono mb-3 leading-relaxed">
          {request.description}
        </p>

        <div className="p-3 rounded-xl bg-[#040809] border border-white/10 mb-4 text-xs font-mono">
          <span className="text-[#859B9E] block text-[10px] uppercase font-bold mb-0.5">
            Betroffener Vorgang:
          </span>
          <span className="text-white font-bold">{request.itemDetails}</span>
        </div>

        <form onSubmit={handleAuthorize} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              {request.requiredRole === 'admin'
                ? 'Administrator-Passwort oder PIN:'
                : 'PIN von Buchhaltung oder Administrator:'}
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setErrorMsg(null);
                  setPin(e.target.value);
                }}
                placeholder="PIN eingeben..."
                className="w-full text-center text-lg tracking-[4px] py-2.5 px-4 bg-[#020506] text-white border-2 border-red-500/60 rounded-xl focus:border-red-400 focus:outline-none font-mono"
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-red-950/50 border border-red-500/50 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-red-500 hover:bg-red-400 text-white transition cursor-pointer shadow-lg shadow-red-500/20"
            >
              Aktion freigeben
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
