/**
 * CODE Werkstatt – Auftrags-API (Cloudflare Worker + D1)
 *
 * Öffentlich (ohne Schlüssel):
 *   POST /api/status   { id, phone4 }  → Status genau eines Auftrags, ohne persönliche Daten
 *
 * Nur Werkstatt (Header "Authorization: Bearer <ADMIN_KEY>"):
 *   GET  /api/auth                     → prüft den Schlüssel
 *   GET  /api/orders                   → alle Aufträge (inkl. Lager-/Termin-Sync-Datensätze)
 *   POST /api/orders { action, ... }   → SAVE_ORDER | UPDATE_STATUS | DELETE_ORDER
 *
 * Secrets / Variablen (siehe worker/README.md):
 *   ADMIN_KEY        – geheimer Werkstatt-Schlüssel (wrangler secret put ADMIN_KEY)
 *   ALLOWED_ORIGINS  – kommagetrennte Liste erlaubter Website-Adressen
 */

interface D1Result<T> {
  results: T[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  DB: D1Database;
  ADMIN_KEY?: string;
  ALLOWED_ORIGINS?: string;
}

type OrderRow = Record<string, unknown> & { id: string };

// Spalten, die der Werkstatt-Manager speichert (siehe src/services/cloudflareSync.ts)
const ORDER_COLUMNS = [
  'id', 'date', 'serviceDate', 'isoDate', 'cust', 'phone', 'address', 'device', 'serial',
  'payMethod', 'isB2B', 'b2bDiscountPercent', 'b2bDiscountVal', 'rawSubtotalNet', 'min',
  'partEK', 'partVKNet', 'netto', 'taxRate', 'taxAmount', 'brutto', 'profit', 'status', 'paid',
] as const;

const SYNC_PREFIX = 'SYNC_';

// Brute-Force-Schutz: max. Fehlversuche pro IP innerhalb des Zeitfensters
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_STATUS_FAILS = 10;
const MAX_AUTH_FAILS = 5;
const RATE_RETENTION_MS = 24 * 60 * 60 * 1000;

const DEFAULT_ORIGINS = ['https://www.code-ger.de', 'https://code-ger.de'];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');

    try {
      if (path === '/api/status' && request.method === 'POST') {
        return await handleStatus(request, env, cors);
      }

      if (path === '/api/auth' || path === '/api/orders') {
        const denied = await requireAdmin(request, env, cors);
        if (denied) return denied;

        if (path === '/api/auth') return json({ success: true }, 200, cors);
        if (request.method === 'GET') return await listOrders(env, cors);
        if (request.method === 'POST') return await handleOrderAction(request, env, cors);
      }

      return json({ success: false, error: 'Nicht gefunden' }, 404, cors);
    } catch (err) {
      console.error('Worker error:', err);
      return json({ success: false, error: 'Serverfehler' }, 500, cors);
    }
  },
};

// ---------------------------------------------------------------------------
// Öffentliche Status-Abfrage
// ---------------------------------------------------------------------------

async function handleStatus(request: Request, env: Env, cors: Headers): Promise<Response> {
  const ip = clientIp(request);
  if (await isRateLimited(env, `status:${ip}`, MAX_STATUS_FAILS)) {
    return json({ success: false, error: 'Zu viele Versuche. Bitte in 15 Minuten erneut probieren.' }, 429, cors);
  }

  const body = (await request.json().catch(() => null)) as { id?: unknown; phone4?: unknown } | null;
  const rawId = typeof body?.id === 'string' ? body.id.trim().toUpperCase().slice(0, 40) : '';
  const phone4 = typeof body?.phone4 === 'string' ? body.phone4.replace(/\D/g, '') : '';

  if (!rawId || phone4.length !== 4 || rawId.startsWith(SYNC_PREFIX)) {
    return json({ success: false, error: 'Bitte Auftragsnummer und die letzten 4 Ziffern der Telefonnummer angeben.' }, 400, cors);
  }

  // KVA- und RE-Nummern bezeichnen denselben Auftrag
  const candidates = Array.from(new Set([rawId, rawId.replace(/^KVA-/, 'RE-'), rawId.replace(/^RE-/, 'KVA-')]));
  const placeholders = candidates.map(() => '?').join(',');
  const row = await env.DB
    .prepare(`SELECT id, date, serviceDate, cust, phone, device, status, paid FROM orders WHERE UPPER(id) IN (${placeholders}) LIMIT 1`)
    .bind(...candidates)
    .first<OrderRow>();

  const storedDigits = String(row?.phone ?? '').replace(/\D/g, '');
  if (!row || storedDigits.length < 4 || storedDigits.slice(-4) !== phone4) {
    await recordFailure(env, `status:${ip}`);
    // Bewusst dieselbe Meldung für "gibt es nicht" und "Ziffern falsch"
    return json({ success: false, error: 'Auftrag nicht gefunden. Bitte Auftragsnummer und Telefonziffern prüfen.' }, 404, cors);
  }

  return json(
    {
      success: true,
      order: {
        id: row.id,
        device: row.device ?? '',
        status: row.status ?? '',
        paid: row.paid === 'Bezahlt' ? 'Bezahlt' : 'Offen',
        date: row.date ?? '',
        serviceDate: row.serviceDate ?? '',
        customer: maskName(String(row.cust ?? '')),
      },
    },
    200,
    cors,
  );
}

function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] + '.')
    .join(' ');
}

// ---------------------------------------------------------------------------
// Werkstatt-Zugriff
// ---------------------------------------------------------------------------

async function requireAdmin(request: Request, env: Env, cors: Headers): Promise<Response | null> {
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 12) {
    return json({ success: false, error: 'ADMIN_KEY ist im Worker nicht (sicher) gesetzt.' }, 503, cors);
  }

  const ip = clientIp(request);
  if (await isRateLimited(env, `auth:${ip}`, MAX_AUTH_FAILS)) {
    return json({ success: false, error: 'Zu viele Fehlversuche. Zugang für 15 Minuten gesperrt.' }, 429, cors);
  }

  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || !(await safeEqual(token, env.ADMIN_KEY))) {
    await recordFailure(env, `auth:${ip}`);
    return json({ success: false, error: 'Werkstatt-Schlüssel ungültig.' }, 401, cors);
  }
  return null;
}

async function listOrders(env: Env, cors: Headers): Promise<Response> {
  const { results } = await env.DB.prepare(`SELECT ${ORDER_COLUMNS.join(', ')} FROM orders`).all<OrderRow>();
  return json(results, 200, cors);
}

async function handleOrderAction(request: Request, env: Env, cors: Headers): Promise<Response> {
  const body = (await request.json().catch(() => null)) as
    | { action?: string; order?: Record<string, unknown>; id?: unknown; status?: unknown }
    | null;

  switch (body?.action) {
    case 'SAVE_ORDER': {
      const order = body.order;
      if (!order || typeof order.id !== 'string' || !order.id) {
        return json({ success: false, error: 'Auftrag ohne ID' }, 400, cors);
      }
      const values = ORDER_COLUMNS.map((col) => {
        const v = order[col];
        if (typeof v === 'boolean') return v ? 1 : 0;
        return v ?? null;
      });
      await env.DB
        .prepare(
          `INSERT OR REPLACE INTO orders (${ORDER_COLUMNS.join(', ')}) VALUES (${ORDER_COLUMNS.map(() => '?').join(', ')})`,
        )
        .bind(...values)
        .run();
      return json({ success: true }, 200, cors);
    }
    case 'UPDATE_STATUS': {
      if (typeof body.id !== 'string' || typeof body.status !== 'string') {
        return json({ success: false, error: 'id und status erforderlich' }, 400, cors);
      }
      await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(body.status, body.id).run();
      return json({ success: true }, 200, cors);
    }
    case 'DELETE_ORDER': {
      if (typeof body.id !== 'string') {
        return json({ success: false, error: 'id erforderlich' }, 400, cors);
      }
      await env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(body.id).run();
      return json({ success: true }, 200, cors);
    }
    default:
      return json({ success: false, error: 'Unbekannte Aktion' }, 400, cors);
  }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function corsHeaders(request: Request, env: Env): Headers {
  const allowed = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;
  const origin = request.headers.get('Origin') || '';
  const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });
  if (allowed.includes(origin) || isLocalDev) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  return headers;
}

function json(data: unknown, status: number, cors: Headers): Response {
  const headers = new Headers(cors);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

// Vergleich in konstanter Zeit, damit der Schlüssel nicht über Antwortzeiten erraten werden kann
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

async function isRateLimited(env: Env, key: string, max: number): Promise<boolean> {
  const row = await env.DB
    .prepare('SELECT count, window_start FROM rate_limits WHERE key = ?')
    .bind(key)
    .first<{ count: number; window_start: number }>();
  if (!row) return false;
  if (Date.now() - row.window_start > RATE_WINDOW_MS) return false;
  return row.count >= max;
}

async function recordFailure(env: Env, key: string): Promise<void> {
  const now = Date.now();
  await env.DB
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN ? - window_start > ? THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN ? - window_start > ? THEN ? ELSE window_start END`,
    )
    .bind(key, now, now, RATE_WINDOW_MS, now, RATE_WINDOW_MS, now)
    .run();
  // Datensparsamkeit: IP-Einträge älter als 24 Stunden löschen (siehe Datenschutzerklärung)
  await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now - RATE_RETENTION_MS).run();
}
