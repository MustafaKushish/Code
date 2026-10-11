import { Order, InventoryItem, Appointment, User, WorkshopSettings } from '../manager/types';

export const CLOUDFLARE_WORKER_BASE = 'https://code-techniker.mustafa-alzurgany.workers.dev';
export const CLOUDFLARE_WORKER_URL = `${CLOUDFLARE_WORKER_BASE}/api/orders`;

// Der Werkstatt-Schlüssel steht NICHT im Code: er wird einmal pro Gerät eingegeben,
// vom Worker geprüft und nur lokal im Browser der Werkstatt gespeichert.
const ADMIN_KEY_STORAGE = 'code_admin_key';
export const ADMIN_UNAUTHORIZED_EVENT = 'code-admin-unauthorized';

export function getAdminKey(): string {
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setAdminKey(key: string) {
  try {
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  } catch {
    // ignore
  }
}

export function clearAdminKey() {
  try {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    // ignore
  }
}

function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...extra, Authorization: `Bearer ${getAdminKey()}` };
}

export type AdminKeyCheck = 'ok' | 'invalid' | 'locked' | 'offline' | 'charset' | 'blocked-origin';

// Nur diese Adressen lässt der Worker zu (siehe worker/src/index.ts, DEFAULT_ORIGINS)
const WORKER_ORIGINS = ['https://www.code-ger.de', 'https://code-ger.de'];

/**
 * Prüft einen Werkstatt-Schlüssel beim Worker
 */
export async function verifyAdminKey(key: string): Promise<AdminKeyCheck> {
  // Browser können Zeichen wie „–“, „€“ oder Emojis nicht im Header senden; fetch bricht dann
  // ohne Netzwerkfehler ab und es sah bisher nach „Server nicht erreichbar“ aus.
  if (/[^\x20-\x7E]/.test(key)) return 'charset';
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_BASE}/api/auth`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) return 'ok';
    if (res.status === 429) return 'locked';
    if (res.status === 401) return 'invalid';
    return 'offline';
  } catch {
    const local = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    if (!local && !WORKER_ORIGINS.includes(window.location.origin)) return 'blocked-origin';
    return 'offline';
  }
}

export function adminKeyErrorText(result: AdminKeyCheck): string {
  switch (result) {
    case 'locked':
      return 'Zu viele Fehlversuche. Zugang für 15 Minuten gesperrt.';
    case 'invalid':
      return 'Werkstatt-Schlüssel stimmt nicht.';
    case 'charset':
      return 'Der Schlüssel enthält Sonderzeichen (z. B. ä, ö, ü, ß, –, €). Bitte in Cloudflare einen Schlüssel nur aus A–Z, a–z, 0–9 und - setzen.';
    case 'blocked-origin':
      return 'Auf dieser Adresse ist der Manager gesperrt. Bitte www.code-ger.de öffnen.';
    default:
      return 'Keine Verbindung zum Server. Bitte Internet prüfen.';
  }
}

export interface PublicOrderStatus {
  id: string;
  device: string;
  status: string;
  paid: 'Bezahlt' | 'Offen';
  date: string;
  serviceDate: string;
  customer: string;
}

/**
 * Öffentliche Status-Abfrage: Auftragsnummer + letzte 4 Ziffern der Telefonnummer.
 * Der Worker liefert nur diesen einen Auftrag ohne persönliche Daten zurück.
 */
export async function fetchPublicOrderStatus(
  id: string,
  phone4: string
): Promise<{ order: PublicOrderStatus | null; error?: string }> {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_BASE}/api/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, phone4 }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success && data.order) return { order: data.order };
    return { order: null, error: data?.error };
  } catch {
    return { order: null, error: 'Status-Server nicht erreichbar. Bitte später erneut versuchen.' };
  }
}

export const INVENTORY_SYNC_ID = 'SYNC_INVENTORY_GLOBAL';
export const APPOINTMENTS_SYNC_ID = 'SYNC_APPOINTMENTS_GLOBAL';
export const USERS_SYNC_ID = 'SYNC_USERS_GLOBAL';
export const SETTINGS_SYNC_ID = 'SYNC_SETTINGS_GLOBAL';

export function sanitizeOrderForWorker(o: Partial<Order>) {
  return {
    id: o.id || '',
    date: o.date || new Date().toLocaleDateString('de-DE'),
    serviceDate: o.serviceDate || o.date || new Date().toLocaleDateString('de-DE'),
    isoDate: o.isoDate || new Date().toISOString(),
    cust: o.cust || '',
    phone: o.phone || '',
    address: o.address || '',
    device: o.device || '',
    serial: o.serial || '',
    payMethod: o.payMethod || 'Bar',
    isB2B: !!o.isB2B,
    b2bDiscountPercent: Number(o.b2bDiscountPercent) || 0,
    b2bDiscountVal: Number(o.b2bDiscountVal) || 0,
    rawSubtotalNet: Number(o.rawSubtotalNet) || 0,
    min: Number(o.min) || 0,
    partEK: Number(o.partEK) || 0,
    partVKNet: Number(o.partVKNet) || 0,
    netto: Number(o.netto) || 0,
    taxRate: Number(o.taxRate) || 19,
    taxAmount: Number(o.taxAmount) || 0,
    brutto: Number(o.brutto) || 0,
    profit: Number(o.profit) || 0,
    status: o.status || 'Eingegangen',
    paid: o.paid || 'Offen'
  };
}

/**
 * Save an order to Cloudflare Worker D1 database
 */
export async function saveOrderToCloudflare(order: Partial<Order>): Promise<boolean> {
  try {
    // Der Worker speichert mit INSERT OR REPLACE. Vorher zu löschen hieße: bricht die
    // Verbindung zwischen den beiden Anfragen ab, ist der Auftrag in der Cloud weg.
    const sanitized = sanitizeOrderForWorker(order);
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'SAVE_ORDER', order: sanitized }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Fehler beim Speichern in Cloudflare D1:', err);
    return false;
  }
}

/**
 * Update status of an order in Cloudflare Worker D1 database
 */
export async function updateOrderStatusInCloudflare(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'UPDATE_STATUS', id, status }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Fehler beim Status-Update in Cloudflare D1:', err);
    return false;
  }
}

/**
 * Delete an order from Cloudflare Worker D1 database
 */
export async function deleteOrderFromCloudflare(id: string): Promise<boolean> {
  try {
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'DELETE_ORDER', id }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Fehler beim Löschen in Cloudflare D1:', err);
    return false;
  }
}

/**
 * Fetch all orders, synced inventory and appointments from Cloudflare Worker
 */
export async function fetchFromCloudflare(): Promise<{
  orders: Order[];
  inventory: InventoryItem[] | null;
  appointments: Appointment[] | null;
  users: User[] | null;
  settings: WorkshopSettings | null;
  success: boolean;
}> {
  const failed = { orders: [] as Order[], inventory: null, appointments: null, users: null, settings: null, success: false };
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_URL}?_t=${Date.now()}`, { headers: adminHeaders() });
    if (res.status === 401) {
      // Schlüssel wurde im Worker geändert oder ist ungültig → Manager neu entsperren lassen
      clearAdminKey();
      window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
    }
    if (!res.ok) {
      return failed;
    }
    const rawData = await res.json();
    if (!Array.isArray(rawData)) {
      return failed;
    }

    let parsedInventory: InventoryItem[] | null = null;
    let parsedAppointments: Appointment[] | null = null;
    let parsedUsers: User[] | null = null;
    let parsedSettings: WorkshopSettings | null = null;
    const orders: Order[] = [];

    for (const item of rawData) {
      if (item && item.id === USERS_SYNC_ID) {
        const list = parseSyncPayload(item.address);
        if (Array.isArray(list) && list.length > 0) parsedUsers = list;
      } else if (item && item.id === SETTINGS_SYNC_ID) {
        const obj = parseSyncPayload(item.address);
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) parsedSettings = obj;
      } else if (item && item.id === INVENTORY_SYNC_ID) {
        const list = parseSyncPayload(item.address);
        if (Array.isArray(list)) parsedInventory = list;
      } else if (item && item.id === APPOINTMENTS_SYNC_ID) {
        const list = parseSyncPayload(item.address);
        if (Array.isArray(list)) parsedAppointments = list;
      } else if (item && item.id && !item.id.startsWith('SYNC_')) {
        orders.push({
          id: item.id,
          date: item.date || '',
          serviceDate: item.serviceDate || item.date || '',
          isoDate: item.isoDate || '',
          cust: item.cust || '',
          phone: item.phone || '',
          address: item.address || '',
          device: item.device || '',
          serial: item.serial || '',
          payMethod: item.payMethod || 'Bar',
          isB2B: !!item.isB2B,
          b2bDiscountPercent: Number(item.b2bDiscountPercent) || 0,
          b2bDiscountVal: Number(item.b2bDiscountVal) || 0,
          rawSubtotalNet: Number(item.rawSubtotalNet) || 0,
          min: Number(item.min) || 0,
          rate: Number(item.rate) || 0,
          partEK: Number(item.partEK) || 0,
          partVKNet: Number(item.partVKNet) || 0,
          consumables: Number(item.consumables) || 0,
          overhead: Number(item.overhead) || 0,
          express: Number(item.express) || 0,
          netto: Number(item.netto) || 0,
          taxRate: Number(item.taxRate) || 19,
          taxAmount: Number(item.taxAmount) || 0,
          brutto: Number(item.brutto) || 0,
          profit: Number(item.profit) || 0,
          status: item.status || 'Eingegangen',
          paid: item.paid || 'Offen',
        });
      }
    }

    return {
      orders,
      inventory: parsedInventory,
      appointments: parsedAppointments,
      users: parsedUsers,
      settings: parsedSettings,
      success: true,
    };
  } catch (err) {
    console.warn('Fehler beim Abrufen von Cloudflare Worker:', err);
    return failed;
  }
}

function parseSyncPayload(raw: unknown): any {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Sync-Datensatz konnte nicht gelesen werden:', e);
    return null;
  }
}

/**
 * Lager, Termine, Mitarbeiter und Stammdaten liegen als JSON in je einem Sync-Datensatz der
 * Auftragstabelle. Ein einziger SAVE_ORDER (INSERT OR REPLACE) ersetzt ihn in einem Schritt.
 */
async function saveSyncRecord(id: string, label: string, data: unknown): Promise<boolean> {
  try {
    const payload = sanitizeOrderForWorker({
      id,
      cust: `SYSTEM_${label}`,
      address: JSON.stringify(data),
      device: `${label}_STORE`,
      status: 'SYSTEM',
      paid: 'SYNC',
    });
    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'SAVE_ORDER', order: payload }),
    });
    if (!res.ok) return false;
    const result = await res.json();
    return !!result.success;
  } catch (err) {
    console.warn(`Fehler beim Speichern (${label}) in Cloudflare:`, err);
    return false;
  }
}

export const saveInventoryToCloudflare = (items: InventoryItem[]) => saveSyncRecord(INVENTORY_SYNC_ID, 'INVENTORY', items);
export const saveAppointmentsToCloudflare = (items: Appointment[]) =>
  saveSyncRecord(APPOINTMENTS_SYNC_ID, 'APPOINTMENTS', items);
// Mitarbeiter nur mit PIN-Hash, nie mit Klartext-PIN
export const saveUsersToCloudflare = (users: User[]) =>
  saveSyncRecord(
    USERS_SYNC_ID,
    'USERS',
    users.map(({ pin: _pin, ...u }) => u)
  );
export const saveSettingsToCloudflare = (settings: WorkshopSettings) =>
  saveSyncRecord(SETTINGS_SYNC_ID, 'SETTINGS', settings);
