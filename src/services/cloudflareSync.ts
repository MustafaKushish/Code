import { Order, InventoryItem, Appointment } from '../manager/types';

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

export type AdminKeyCheck = 'ok' | 'invalid' | 'locked' | 'offline';

/**
 * Prüft einen Werkstatt-Schlüssel beim Worker
 */
export async function verifyAdminKey(key: string): Promise<AdminKeyCheck> {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_BASE}/api/auth`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) return 'ok';
    if (res.status === 429) return 'locked';
    if (res.status === 401) return 'invalid';
    return 'offline';
  } catch {
    return 'offline';
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
    const sanitized = sanitizeOrderForWorker(order);
    if (sanitized.id) {
      await deleteOrderFromCloudflare(sanitized.id);
    }
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
  success: boolean;
}> {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_URL}?_t=${Date.now()}`, { headers: adminHeaders() });
    if (res.status === 401) {
      // Schlüssel wurde im Worker geändert oder ist ungültig → Manager neu entsperren lassen
      clearAdminKey();
      window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
    }
    if (!res.ok) {
      return { orders: [], inventory: null, appointments: null, success: false };
    }
    const rawData = await res.json();
    if (!Array.isArray(rawData)) {
      return { orders: [], inventory: null, appointments: null, success: false };
    }

    let parsedInventory: InventoryItem[] | null = null;
    let parsedAppointments: Appointment[] | null = null;
    const orders: Order[] = [];

    for (const item of rawData) {
      if (item && item.id === INVENTORY_SYNC_ID) {
        try {
          if (item.address) {
            const inv = JSON.parse(item.address);
            if (Array.isArray(inv)) {
              parsedInventory = inv;
            }
          }
        } catch (e) {
          console.warn('Fehler beim Parsen des Cloudflare-Lagerbestands:', e);
        }
      } else if (item && item.id === APPOINTMENTS_SYNC_ID) {
        try {
          if (item.address) {
            const apts = JSON.parse(item.address);
            if (Array.isArray(apts)) {
              parsedAppointments = apts;
            }
          }
        } catch (e) {
          console.warn('Fehler beim Parsen der Cloudflare-Termine:', e);
        }
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

    return { orders, inventory: parsedInventory, appointments: parsedAppointments, success: true };
  } catch (err) {
    console.warn('Fehler beim Abrufen von Cloudflare Worker:', err);
    return { orders: [], inventory: null, appointments: null, success: false };
  }
}

/**
 * Save inventory list to Cloudflare Worker
 */
export async function saveInventoryToCloudflare(items: InventoryItem[]): Promise<boolean> {
  try {
    // Delete old record first so D1 accepts updated payload
    await deleteOrderFromCloudflare(INVENTORY_SYNC_ID);

    const payload = sanitizeOrderForWorker({
      id: INVENTORY_SYNC_ID,
      cust: 'SYSTEM_INVENTORY',
      address: JSON.stringify(items),
      device: 'INVENTORY_STORE',
      status: 'SYSTEM',
      paid: 'SYNC',
    });

    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'SAVE_ORDER', order: payload }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Fehler beim Speichern des Lagers in Cloudflare:', err);
    return false;
  }
}

/**
 * Save appointments list to Cloudflare Worker D1 database
 */
export async function saveAppointmentsToCloudflare(items: Appointment[]): Promise<boolean> {
  try {
    // Delete old record first so D1 accepts updated payload
    await deleteOrderFromCloudflare(APPOINTMENTS_SYNC_ID);

    const payload = sanitizeOrderForWorker({
      id: APPOINTMENTS_SYNC_ID,
      cust: 'SYSTEM_APPOINTMENTS',
      address: JSON.stringify(items),
      device: 'APPOINTMENTS_STORE',
      status: 'SYSTEM',
      paid: 'SYNC',
    });

    const res = await fetch(CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action: 'SAVE_ORDER', order: payload }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Fehler beim Speichern der Termine in Cloudflare:', err);
    return false;
  }
}
