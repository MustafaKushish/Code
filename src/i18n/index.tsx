// Mehrsprachigkeit der Kunden-Website (Deutsch, Englisch, Türkisch, Arabisch).
// Der deutsche Text im Code ist zugleich der Schlüssel: t('Preise') liefert auf Englisch „Prices“.
// Fehlt eine Übersetzung, erscheint der deutsche Text. Prüfen mit: npm run i18n:check
// Der Werkstatt-Manager bleibt bewusst nur auf Deutsch.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'de' | 'en' | 'tr' | 'ar';
type Dict = Record<string, string>;
type Vars = Record<string, string | number>;

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'ar', label: 'العربية', short: 'AR' },
];

const LOCALES: Record<Lang, string> = {
  de: 'de-DE',
  en: 'en-GB',
  tr: 'tr-TR',
  // Arabisch mit westlichen Ziffern, damit Preise und Telefonnummern überall gleich aussehen
  ar: 'ar-u-nu-latn',
};

const STORAGE_KEY = 'code_lang';

// Wörterbücher werden erst geladen, wenn die Sprache gebraucht wird (Deutsch braucht keins)
const LOADERS: Record<Exclude<Lang, 'de'>, () => Promise<{ default: Dict }>> = {
  en: () => import('./locales/en.json'),
  tr: () => import('./locales/tr.json'),
  ar: () => import('./locales/ar.json'),
};

const dictCache: Partial<Record<Lang, Dict>> = { de: {} };

/** Markiert deutschen Text außerhalb von Komponenten als übersetzbar (für npm run i18n:check). */
export const msg = (s: string) => s;

function isLang(v: unknown): v is Lang {
  return v === 'de' || v === 'en' || v === 'tr' || v === 'ar';
}

function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/** ?lang=en in der Adresse > gespeicherte Wahl > Browsersprache > Deutsch */
export function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'de';
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  const stored = readStoredLang();
  if (stored) return stored;
  for (const l of navigator.languages || [navigator.language]) {
    const code = (l || '').slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return 'de';
}

async function loadDict(lang: Lang): Promise<Dict> {
  if (dictCache[lang]) return dictCache[lang]!;
  const mod = await LOADERS[lang as Exclude<Lang, 'de'>]();
  dictCache[lang] = mod.default;
  return mod.default;
}

/** Vor dem ersten Rendern aufrufen, damit Besucher keine deutschen Texte aufblitzen sehen. */
export async function bootI18n(): Promise<void> {
  const lang = detectLanguage();
  if (lang === 'de') return;
  await Promise.race([loadDict(lang).catch(() => undefined), new Promise((r) => setTimeout(r, 2500))]);
}

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export interface I18n {
  lang: Lang;
  locale: string;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Lang) => void;
  /** Übersetzt einen deutschen Text; {name} wird durch vars.name ersetzt. */
  t: (german: string, vars?: Vars) => string;
  /** Euro-Betrag im Format der Sprache, z. B. „79,00 €“ oder „€79.00“ */
  euro: (value: number, decimals?: number) => string;
}

const I18nContext = createContext<I18n | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const detected = detectLanguage();
    return dictCache[detected] ? detected : 'de';
  });
  const [dict, setDict] = useState<Dict>(() => dictCache[lang] || {});

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Privater Modus: Wahl gilt dann nur für diesen Besuch
    }
    loadDict(next)
      .then((d) => {
        setDict(d);
        setLangState(next);
      })
      .catch(() => {
        setDict({});
        setLangState('de');
      });
  }, []);

  // Erkannte Sprache nachladen, falls bootI18n zu langsam war
  useEffect(() => {
    const detected = detectLanguage();
    if (detected !== lang && !dictCache[detected]) setLang(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<I18n>(() => {
    const locale = LOCALES[lang];
    const euroFormats = new Map<number, Intl.NumberFormat>();
    return {
      lang,
      locale,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      setLang,
      t: (german, vars) => interpolate(dict[german] || german, vars),
      euro: (n, decimals = 2) => {
        let f = euroFormats.get(decimals);
        if (!f) {
          f = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
          euroFormats.set(decimals, f);
        }
        return f.format(n);
      },
    };
  }, [lang, dict, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n außerhalb von LanguageProvider');
  return ctx;
}

/** Setzt lang/dir am <html>-Element. Im Manager immer Deutsch und links-nach-rechts. */
export function useDocumentLanguage(active: boolean) {
  const { lang, dir } = useI18n();
  useEffect(() => {
    const html = document.documentElement;
    html.lang = active ? lang : 'de';
    html.dir = active ? dir : 'ltr';
  }, [lang, dir, active]);
}
