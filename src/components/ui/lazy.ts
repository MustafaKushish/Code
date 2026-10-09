import { lazy, useEffect, useState, ComponentType } from 'react';

/** React.lazy für benannte Exporte: lazyNamed(() => import('./X'), 'X') */
export function lazyNamed<M extends Record<string, unknown>, K extends keyof M>(loader: () => Promise<M>, name: K) {
  return lazy(async () => ({ default: (await loader())[name] as ComponentType<any> }));
}

/** Wird true, sobald `active` einmal true war – hält Dialoge nach dem ersten Öffnen gemountet (Zustand bleibt erhalten). */
export function useMountedOnce(active: boolean) {
  const [mounted, setMounted] = useState(active);
  useEffect(() => {
    if (active) setMounted(true);
  }, [active]);
  return mounted || active;
}

/** Lädt Code-Teile im Leerlauf vor, damit sie beim ersten Klick sofort da sind. */
export function prefetchWhenIdle(loaders: Array<() => Promise<unknown>>) {
  const run = () => loaders.forEach((load) => load().catch(() => undefined));
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2500);
}
