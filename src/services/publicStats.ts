import { CLOUDFLARE_WORKER_BASE } from './cloudflareSync';

const CACHE_KEY = 'code_repaired_count';
const CACHE_MS = 60 * 60 * 1000;

/**
 * Anzahl abgeschlossener Reparaturen aus dem Worker (GET /api/stats).
 * null, wenn der Worker die Zahl (noch) nicht liefert – dann zeigt die Website nichts an.
 */
export async function fetchRepairedCount(): Promise<number | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null') as { n: number; at: number } | null;
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.n;
  } catch {
    // Kein Zwischenspeicher verfügbar
  }
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_BASE}/api/stats`);
    if (!res.ok) return null;
    const data = await res.json();
    const n = Number(data?.repaired);
    if (!data?.success || !Number.isFinite(n)) return null;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ n, at: Date.now() }));
    } catch {
      // egal
    }
    return n;
  } catch {
    return null;
  }
}
