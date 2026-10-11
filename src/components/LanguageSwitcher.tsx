import React, { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { LANGUAGES, useI18n } from '../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('Sprache wählen')}
        className="inline-flex h-9 items-center gap-1 px-2 rounded-xl text-xs font-mono font-bold text-zinc-200 bg-white/5 border border-white/10 hover:border-[#00F5D4]/60 hover:text-[#00F5D4] transition-all cursor-pointer"
      >
        <Globe className="w-4 h-4" />
        <span>{current.short}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t('Sprache wählen')}
          className="absolute end-0 top-full mt-2 min-w-40 bg-[#080E10]/98 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                lang={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm text-start cursor-pointer ${
                  l.code === lang ? 'text-[#00F5D4] bg-[#00F5D4]/10' : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <span>{l.label}</span>
                {l.code === lang && <Check className="w-4 h-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
