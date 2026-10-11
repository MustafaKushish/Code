// CODE Werkstatt Auftrags-API - automatisch erzeugt aus worker/src/index.ts. Gesamten Inhalt im Cloudflare-Editor einfuegen.
const ORDER_COLUMNS = [
  "id",
  "date",
  "serviceDate",
  "isoDate",
  "cust",
  "phone",
  "address",
  "device",
  "serial",
  "payMethod",
  "isB2B",
  "b2bDiscountPercent",
  "b2bDiscountVal",
  "rawSubtotalNet",
  "min",
  "partEK",
  "partVKNet",
  "netto",
  "taxRate",
  "taxAmount",
  "brutto",
  "profit",
  "status",
  "paid"
];
const SYNC_PREFIX = "SYNC_";
const RATE_WINDOW_MS = 15 * 60 * 1e3;
const MAX_STATUS_FAILS = 10;
const MAX_AUTH_FAILS = 5;
const RATE_RETENTION_MS = 24 * 60 * 60 * 1e3;
const DEFAULT_ORIGINS = ["https://www.code-ger.de", "https://code-ger.de"];
var index_default = {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");
    try {
      if (path === "/api/status" && request.method === "POST") {
        return await handleStatus(request, env, cors);
      }
      if (path === "/api/stats" && request.method === "GET") {
        return await handleStats(env, cors);
      }
      if (path === "/api/auth" || path === "/api/orders") {
        const denied = await requireAdmin(request, env, cors);
        if (denied) return denied;
        if (path === "/api/auth") return json({ success: true }, 200, cors);
        if (request.method === "GET") return await listOrders(env, cors);
        if (request.method === "POST") return await handleOrderAction(request, env, cors);
      }
      return json({ success: false, error: "Nicht gefunden" }, 404, cors);
    } catch (err) {
      console.error("Worker error:", err);
      return json({ success: false, error: "Serverfehler" }, 500, cors);
    }
  }
};
async function handleStatus(request, env, cors) {
  const ip = clientIp(request);
  if (await isRateLimited(env, `status:${ip}`, MAX_STATUS_FAILS)) {
    return json({ success: false, error: "Zu viele Versuche. Bitte in 15 Minuten erneut probieren." }, 429, cors);
  }
  const body = await request.json().catch(() => null);
  const rawId = typeof body?.id === "string" ? body.id.trim().toUpperCase().slice(0, 40) : "";
  const phone4 = typeof body?.phone4 === "string" ? body.phone4.replace(/\D/g, "") : "";
  if (!rawId || phone4.length !== 4 || rawId.startsWith(SYNC_PREFIX)) {
    return json({ success: false, error: "Bitte Auftragsnummer und die letzten 4 Ziffern der Telefonnummer angeben." }, 400, cors);
  }
  const candidates = Array.from(/* @__PURE__ */ new Set([rawId, rawId.replace(/^KVA-/, "RE-"), rawId.replace(/^RE-/, "KVA-")]));
  const placeholders = candidates.map(() => "?").join(",");
  const row = await env.DB.prepare(`SELECT id, date, serviceDate, cust, phone, device, status, paid FROM orders WHERE UPPER(id) IN (${placeholders}) LIMIT 1`).bind(...candidates).first();
  const storedDigits = String(row?.phone ?? "").replace(/\D/g, "");
  if (!row || storedDigits.length < 4 || storedDigits.slice(-4) !== phone4) {
    await recordFailure(env, `status:${ip}`);
    return json({ success: false, error: "Auftrag nicht gefunden. Bitte Auftragsnummer und Telefonziffern pr\xFCfen." }, 404, cors);
  }
  return json(
    {
      success: true,
      order: {
        id: row.id,
        device: row.device ?? "",
        status: row.status ?? "",
        paid: row.paid === "Bezahlt" ? "Bezahlt" : "Offen",
        date: row.date ?? "",
        serviceDate: row.serviceDate ?? "",
        customer: maskName(String(row.cust ?? ""))
      }
    },
    200,
    cors
  );
}
const REPAIRED_SQL = `SELECT COUNT(*) AS n FROM orders
  WHERE id NOT LIKE '${SYNC_PREFIX}%' AND id NOT LIKE 'KVA-%'
    AND (status = 'Abgeschlossen' OR status LIKE '5.%' OR LOWER(status) LIKE '%abgeholt%' OR LOWER(status) LIKE '%abholbereit%')`;
async function handleStats(env, cors) {
  const row = await env.DB.prepare(REPAIRED_SQL).first();
  const headers = new Headers(cors);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=3600");
  return new Response(JSON.stringify({ success: true, repaired: Number(row?.n ?? 0) }), { status: 200, headers });
}
function maskName(name) {
  return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0] + ".").join(" ");
}
async function requireAdmin(request, env, cors) {
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 12) {
    return json({ success: false, error: "ADMIN_KEY ist im Worker nicht (sicher) gesetzt." }, 503, cors);
  }
  const ip = clientIp(request);
  if (await isRateLimited(env, `auth:${ip}`, MAX_AUTH_FAILS)) {
    return json({ success: false, error: "Zu viele Fehlversuche. Zugang f\xFCr 15 Minuten gesperrt." }, 429, cors);
  }
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || !await safeEqual(token, env.ADMIN_KEY)) {
    await recordFailure(env, `auth:${ip}`);
    return json({ success: false, error: "Werkstatt-Schl\xFCssel ung\xFCltig." }, 401, cors);
  }
  return null;
}
async function listOrders(env, cors) {
  const { results } = await env.DB.prepare(`SELECT ${ORDER_COLUMNS.join(", ")} FROM orders ORDER BY isoDate DESC`).all();
  return json(
    results.map((o) => ({ ...o, isB2B: !!o.isB2B })),
    200,
    cors
  );
}
async function handleOrderAction(request, env, cors) {
  const body = await request.json().catch(() => null);
  switch (body?.action) {
    case "SAVE_ORDER": {
      const order = body.order;
      if (!order || typeof order.id !== "string" || !order.id) {
        return json({ success: false, error: "Auftrag ohne ID" }, 400, cors);
      }
      const values = ORDER_COLUMNS.map((col) => {
        const v = order[col];
        if (typeof v === "boolean") return v ? 1 : 0;
        return v ?? null;
      });
      await env.DB.prepare(
        `INSERT OR REPLACE INTO orders (${ORDER_COLUMNS.join(", ")}) VALUES (${ORDER_COLUMNS.map(() => "?").join(", ")})`
      ).bind(...values).run();
      return json({ success: true, id: order.id }, 200, cors);
    }
    case "UPDATE_STATUS": {
      if (typeof body.id !== "string" || typeof body.status !== "string" && typeof body.paid !== "string") {
        return json({ success: false, error: "id und status oder paid erforderlich" }, 400, cors);
      }
      if (typeof body.status === "string") {
        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(body.status, body.id).run();
      }
      if (typeof body.paid === "string") {
        await env.DB.prepare("UPDATE orders SET paid = ? WHERE id = ?").bind(body.paid, body.id).run();
      }
      return json({ success: true }, 200, cors);
    }
    case "DELETE_ORDER": {
      if (typeof body.id !== "string") {
        return json({ success: false, error: "id erforderlich" }, 400, cors);
      }
      await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(body.id).run();
      return json({ success: true }, 200, cors);
    }
    default:
      return json({ success: false, error: "Unbekannte Aktion" }, 400, cors);
  }
}
function corsHeaders(request, env) {
  const allowed = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean) : DEFAULT_ORIGINS;
  const origin = request.headers.get("Origin") || "";
  const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = new Headers({
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  });
  if (allowed.includes(origin) || isLocalDev) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}
function json(data, status, cors) {
  const headers = new Headers(cors);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status, headers });
}
function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}
async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}
async function isRateLimited(env, key, max) {
  const row = await env.DB.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").bind(key).first();
  if (!row) return false;
  if (Date.now() - row.window_start > RATE_WINDOW_MS) return false;
  return row.count >= max;
}
async function recordFailure(env, key) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN ? - window_start > ? THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN ? - window_start > ? THEN ? ELSE window_start END`
  ).bind(key, now, now, RATE_WINDOW_MS, now, RATE_WINDOW_MS, now).run();
  await env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?").bind(now - RATE_RETENTION_MS).run();
}
export {
  index_default as default
};
