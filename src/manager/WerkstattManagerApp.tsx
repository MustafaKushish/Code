import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Settings,
  LogOut,
  Calendar,
  Cloud,
  CloudOff,
  FileText,
  Download,
  Upload,
  FileSpreadsheet,
  LayoutDashboard,
  Calculator,
  ClipboardList,
  Package,
  TrendingUp,
  WifiOff,
  ArrowLeft,
  Bot,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  FolderArchive,
  Search,
} from 'lucide-react';
import {
  User,
  WorkshopSettings,
  InventoryItem,
  Order,
  Appointment,
  AdminAuthRequest,
  TaxReportPayload,
} from './types';
import { DEFAULT_USERS, DEFAULT_WORKSHOP_SETTINGS } from './defaultData';
import { withPin, hasLegacyPin, migrateLegacyPins, publicUser } from './pinAuth';
import { LockScreen } from './LockScreen';
import { DashboardView } from './DashboardView';
import { CalculatorView } from './CalculatorView';
import { OrdersView } from './OrdersView';
import { AppointmentsView } from './AppointmentsView';
import { InventoryView } from './InventoryView';
import { AnalyticsView } from './AnalyticsView';
import { SettingsModal } from './SettingsModal';
import { TaxModal } from './TaxModal';
import { AdminConfirmModal } from './AdminConfirmModal';
import { WhatsAppModal } from './WhatsAppModal';
import { DeviceLabelModal } from './DeviceLabelModal';
import { OrderPhotosModal } from './OrderPhotosModal';
import { CustomerSignatureModal } from './CustomerSignatureModal';
import { SupplierOrderModal } from './SupplierOrderModal';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { PrintTemplates } from './PrintTemplates';
import { PWAInstallButton } from './PWAInstallButton';
import { AiTechnicianWorkerView } from './AiTechnicianWorkerView';
import {
  saveOrderToCloudflare,
  updateOrderStatusInCloudflare,
  deleteOrderFromCloudflare,
  fetchFromCloudflare,
  saveInventoryToCloudflare,
  saveAppointmentsToCloudflare,
  saveUsersToCloudflare,
  saveSettingsToCloudflare,
} from '../services/cloudflareSync';

// Felder, die der Worker in D1 speichert. Alles andere (Fotos, Unterschrift, Fehlerbeschreibung,
// Techniker, Kalkulationsdetails) gibt es nur lokal und darf beim Abgleich nicht verloren gehen.
const CLOUD_ORDER_FIELDS = [
  'date', 'serviceDate', 'isoDate', 'cust', 'phone', 'address', 'device', 'serial', 'payMethod',
  'isB2B', 'b2bDiscountPercent', 'b2bDiscountVal', 'rawSubtotalNet', 'min', 'partEK', 'partVKNet',
  'netto', 'taxRate', 'taxAmount', 'brutto', 'profit', 'status', 'paid',
] as const;

const UNSYNCED_ORDERS_KEY = 'code_unsynced_orders';

function readUnsyncedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(UNSYNCED_ORDERS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function mergeCloudOrders(local: Order[], cloud: Order[], unsynced: Set<string>): Order[] {
  const localById = new Map(local.map((o) => [o.id, o]));
  const cloudIds = new Set(cloud.map((o) => o.id));
  const merged = cloud.map((c) => {
    const l = localById.get(c.id);
    if (!l) return c;
    const next: Order = { ...l };
    for (const f of CLOUD_ORDER_FIELDS) (next as any)[f] = (c as any)[f];
    return next;
  });
  // Lokal angelegte Aufträge, deren Upload noch aussteht, bleiben erhalten
  const pending = local.filter((o) => unsynced.has(o.id) && !cloudIds.has(o.id));
  return [...pending, ...merged];
}

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface WerkstattManagerAppProps {
  onBackToWebsite: () => void;
}

export const WerkstattManagerApp: React.FC<WerkstattManagerAppProps> = ({ onBackToWebsite }) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOn = () => setIsOnline(true);
    const handleOff = () => setIsOnline(false);
    window.addEventListener('online', handleOn);
    window.addEventListener('offline', handleOff);
    return () => {
      window.removeEventListener('online', handleOn);
      window.removeEventListener('offline', handleOff);
    };
  }, []);

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('code_users_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  // Active user
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem('code_active_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return publicUser(parsed);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Lockscreen state
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return sessionStorage.getItem('code_wws_unlocked') !== 'true';
  });

  // Workshop settings
  const [workshopSettings, setWorkshopSettings] = useState<WorkshopSettings>(() => {
    try {
      const stored = localStorage.getItem('code_workshop_settings_v1');
      return stored ? JSON.parse(stored) : DEFAULT_WORKSHOP_SETTINGS;
    } catch {
      return DEFAULT_WORKSHOP_SETTINGS;
    }
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calc' | 'orders' | 'appointments' | 'inventory' | 'analytics' | 'ai_diagnose'>('dashboard');

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('code_orders_v2');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = localStorage.getItem('code_appointments_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('code_inventory_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaxOpen, setIsTaxOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [adminRequest, setAdminRequest] = useState<AdminAuthRequest | null>(null);
  const [waOrder, setWaOrder] = useState<Order | null>(null);
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);
  const [photosOrder, setPhotosOrder] = useState<Order | null>(null);
  const [sigOrder, setSigOrder] = useState<Order | null>(null);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [docPreview, setDocPreview] = useState<{ order: Order; mode: 'invoice' | 'kva' } | null>(null);

  // Print templates data
  const [invoicePrintData, setInvoicePrintData] = useState<Partial<Order> | null>(null);
  const [kvaPrintData, setKvaPrintData] = useState<Partial<Order> | null>(null);
  const [taxReportPrintData, setTaxReportPrintData] = useState<TaxReportPayload | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('code_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('code_workshop_settings_v1', JSON.stringify(workshopSettings));
  }, [workshopSettings]);

  useEffect(() => {
    localStorage.setItem('code_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('code_inventory_v1', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('code_appointments_v1', JSON.stringify(appointments));
  }, [appointments]);

  // Klartext-PINs aus älteren Versionen einmalig in Hashes umwandeln
  useEffect(() => {
    if (!hasLegacyPin(users)) return;
    migrateLegacyPins(users)
      .then((migrated) => setUsers(migrated))
      .catch((err) => console.warn('PINs konnten nicht umgestellt werden:', err));
  }, [users]);

  // Neueste Werte für den Hintergrund-Abgleich (Intervall-Callbacks sehen sonst alte Stände)
  const ordersRef = useRef(orders);
  const usersRef = useRef(users);
  const settingsRef = useRef(workshopSettings);
  ordersRef.current = orders;
  usersRef.current = users;
  settingsRef.current = workshopSettings;

  // Laufende Uploads: Solange einer läuft, wird ein Abgleich nicht übernommen, damit eine gerade
  // gemachte Änderung nicht kurz von einem älteren Cloud-Stand überschrieben wird.
  const pendingWrites = useRef(0);
  const writeSeq = useRef(0);
  const unsyncedOrders = useRef<Set<string>>(readUnsyncedIds());

  const trackWrite = <T,>(promise: Promise<T>): Promise<T> => {
    pendingWrites.current += 1;
    writeSeq.current += 1;
    return promise.finally(() => {
      pendingWrites.current -= 1;
    });
  };

  const persistUnsynced = () => {
    try {
      localStorage.setItem(UNSYNCED_ORDERS_KEY, JSON.stringify([...unsyncedOrders.current]));
    } catch {
      // ignore
    }
  };

  const pushOrder = (order: Order) =>
    trackWrite(saveOrderToCloudflare(order)).then((ok) => {
      if (ok) unsyncedOrders.current.delete(order.id);
      else unsyncedOrders.current.add(order.id);
      persistUnsynced();
      setWorkerConnected(ok);
      return ok;
    });

  const pushInventory = (items: InventoryItem[]) => trackWrite(saveInventoryToCloudflare(items));
  const pushAppointments = (items: Appointment[]) => trackWrite(saveAppointmentsToCloudflare(items));

  const commitUsers = async (next: User[]) => {
    const hashed = hasLegacyPin(next) ? await migrateLegacyPins(next) : next;
    setUsers(hashed);
    trackWrite(saveUsersToCloudflare(hashed));
  };

  const commitSettings = (next: WorkshopSettings) => {
    setWorkshopSettings(next);
    trackWrite(saveSettingsToCloudflare(next));
  };

  // Cloudflare Worker Sync (https://code-techniker.mustafa-alzurgany.workers.dev/api/orders)
  const [workerConnected, setWorkerConnected] = useState(true);
  const syncRunning = useRef(false);

  const syncWithCloudflareWorker = async () => {
    if (syncRunning.current) return;
    syncRunning.current = true;
    try {
      // Aufträge, deren Upload fehlgeschlagen ist, zuerst erneut senden
      for (const id of [...unsyncedOrders.current]) {
        const order = ordersRef.current.find((o) => o.id === id);
        if (order) await pushOrder(order);
        else {
          unsyncedOrders.current.delete(id);
          persistUnsynced();
        }
      }

      const seqAtStart = writeSeq.current;
      const result = await fetchFromCloudflare();
      if (!result.success) {
        setWorkerConnected(false);
        return;
      }
      setWorkerConnected(true);
      if (pendingWrites.current > 0 || writeSeq.current !== seqAtStart) return;

      // 1. Aufträge: Cloud bestimmt Status, Preise und welche Aufträge existieren,
      //    lokale Zusatzdaten (Fotos, Unterschrift, Fehlerbeschreibung) bleiben erhalten
      if (result.orders.length > 0) {
        setOrders((prev) => {
          const next = mergeCloudOrders(prev, result.orders, unsyncedOrders.current);
          return sameJson(prev, next) ? prev : next;
        });
      }

      // 2./3. Lager und Termine ([] ist ein gültiger, leerer Stand)
      if (result.inventory) {
        setInventory((prev) => (sameJson(prev, result.inventory) ? prev : result.inventory!));
      }
      if (result.appointments) {
        setAppointments((prev) => (sameJson(prev, result.appointments) ? prev : result.appointments!));
      }

      // 4. Mitarbeiter und Stammdaten: gleiche PINs auf allen Geräten.
      //    Gibt es sie in der Cloud noch nicht, lädt dieses Gerät seinen Stand hoch.
      if (result.users) {
        setUsers((prev) => (sameJson(prev, result.users) ? prev : result.users!));
      } else {
        await commitUsers(usersRef.current);
      }
      if (result.settings) {
        setWorkshopSettings((prev) =>
          sameJson(prev, result.settings) ? prev : { ...DEFAULT_WORKSHOP_SETTINGS, ...result.settings }
        );
      } else {
        trackWrite(saveSettingsToCloudflare(settingsRef.current));
      }
    } catch {
      setWorkerConnected(false);
    } finally {
      syncRunning.current = false;
    }
  };

  // Background Auto-Sync: Every 15 seconds + on window focus/tab resume (Handy & PC)
  useEffect(() => {
    syncWithCloudflareWorker();

    const interval = setInterval(() => {
      syncWithCloudflareWorker();
    }, 15000);

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        syncWithCloudflareWorker();
      }
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, []);

  // Auth unlock
  const handleUnlock = (user: User) => {
    const safeUser = publicUser(user);
    setActiveUser(safeUser);
    sessionStorage.setItem('code_active_user', JSON.stringify(safeUser));
    sessionStorage.setItem('code_wws_unlocked', 'true');
    setIsLocked(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('code_wws_unlocked');
    sessionStorage.removeItem('code_active_user');
    setActiveUser(null);
    setIsLocked(true);
  };

  // Inactivity Auto-Logout after 5 minutes of NO interaction
  useEffect(() => {
    if (isLocked) return;

    const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 Minuten
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_LIMIT_MS);
    };

    // Events that signify active user presence (writing, clicking, scrolling, touch)
    const activeEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'input',
      'click',
      'wheel',
    ];

    activeEvents.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    // Start timer on mount / unlock
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activeEvents.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
      });
    };
  }, [isLocked]);

  // Global Keyboard Shortcuts (Strg+1 bis Strg+6 / Alt+1 bis Alt+6 / Cmd+1 bis Cmd+6)
  useEffect(() => {
    if (isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Ctrl, Alt, or Meta (Command on Mac)
      const isModifier = e.ctrlKey || e.altKey || e.metaKey;

      if (isModifier) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('calc');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('orders');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('appointments');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveTab('inventory');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveTab('analytics');
        } else if (e.key === '7') {
          e.preventDefault();
          setActiveTab('ai_diagnose');
        }
      }

      // Quick ESC to close all open modals
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsTaxOpen(false);
        setIsToolsMenuOpen(false);
        setAdminRequest(null);
        setWaOrder(null);
        setLabelOrder(null);
        setPhotosOrder(null);
        setSigOrder(null);
        setIsSupplierOpen(false);
        setDocPreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked]);

  // Orders Actions: Saved immediately locally + live to Cloudflare Worker D1
  const handleSaveOrder = (orderData: Partial<Order>, linkedPartId?: string) => {
    const year = new Date().getFullYear();
    const id = orderData.id || `RE-${year}-${Date.now().toString().slice(-5)}`;
    const newOrder: Order = {
      ...(orderData as Order),
      id,
      isoDate: orderData.isoDate || new Date().toISOString(),
      linkedPartId,
      technician: orderData.technician || activeUser?.name || 'Mustafa Al-Zurgany',
    };

    // Deduct stock if a spare part was linked
    if (linkedPartId) {
      adjustStock([{ id: linkedPartId, delta: -1 }]);
    }

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== id)]);
    setActiveTab('orders');

    // Immediately save complete order to Cloudflare Worker D1
    pushOrder(newOrder);
  };

  const handleChangeOrderStatus = (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    // Remote update on Cloudflare Worker D1
    trackWrite(updateOrderStatusInCloudflare(id, status));
  };

  const handleTogglePaid = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const updated = { ...order, paid: order.paid === 'Bezahlt' ? 'Offen' : 'Bezahlt' };
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    pushOrder(updated);
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    unsyncedOrders.current.delete(id);
    persistUnsynced();

    // Remote delete on Cloudflare Worker D1
    trackWrite(deleteOrderFromCloudflare(id));
  };

  // Inventory actions: Saved locally + live to Cloudflare Worker D1
  const handleAddPart = (part: Omit<InventoryItem, 'id'>) => {
    const existing = inventory.find((p) => p.name.toLowerCase() === part.name.toLowerCase());
    let nextInv: InventoryItem[];
    if (existing) {
      nextInv = inventory.map((p) =>
        p.id === existing.id
          ? { ...p, qty: p.qty + part.qty, ek: part.ek > 0 ? part.ek : p.ek }
          : p
      );
    } else {
      const id = 'P-' + Date.now().toString().slice(-6);
      nextInv = [...inventory, { ...part, id }];
    }
    setInventory(nextInv);
    pushInventory(nextInv);
  };

  // Mehrere Bestandsänderungen in einem Schritt, damit keine die andere überschreibt
  const adjustStock = (changes: { id: string; delta: number }[]) => {
    const nextInv = inventory.map((item) => {
      const delta = changes.filter((c) => c.id === item.id).reduce((sum, c) => sum + c.delta, 0);
      return delta ? { ...item, qty: Math.max(0, item.qty + delta) } : item;
    });
    setInventory(nextInv);
    pushInventory(nextInv);
  };

  const handleAdjustStock = (id: string, delta: number) => adjustStock([{ id, delta }]);

  const handleDeletePart = (id: string) => {
    const nextInv = inventory.filter((p) => p.id !== id);
    setInventory(nextInv);
    pushInventory(nextInv);
  };

  const handleClearAllInventory = () => {
    setInventory([]);
    pushInventory([]);
  };

  // Appointment Handlers
  const updateAppointments = (next: Appointment[]) => {
    setAppointments(next);
    pushAppointments(next);
  };

  const handleAddAppointment = (apt: Appointment) => updateAppointments([apt, ...appointments]);

  const handleUpdateAppointment = (apt: Appointment) =>
    updateAppointments(appointments.map((a) => (a.id === apt.id ? apt : a)));

  const handleDeleteAppointment = (id: string) => updateAppointments(appointments.filter((a) => a.id !== id));

  const handleClearAllAppointments = () => updateAppointments([]);

  const handleClearAllOrders = async () => {
    const ids = orders.map((o) => o.id);
    setOrders([]);
    unsyncedOrders.current.clear();
    persistUnsynced();
    for (const id of ids) {
      await trackWrite(deleteOrderFromCloudflare(id));
    }
  };

  const handleConvertAppointmentToOrder = (apt: Appointment) => {
    let newOrderId = '';
    do {
      newOrderId = `CODE-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (orders.some((o) => o.id === newOrderId));

    // Calculate parts EK if matched and deduct from stock
    let partEK = 0;
    let linkedPartId: string | undefined = undefined;
    const stockChanges: { id: string; delta: number }[] = [];
    if (apt.requiredParts && apt.requiredParts.length > 0) {
      for (const p of apt.requiredParts) {
        const match = inventory.find(
          (i) => i.id === p.inventoryId || i.name.toLowerCase().includes(p.partName.toLowerCase())
        );
        if (match) {
          partEK += (match.ek || 0) * (p.qtyNeeded || 1);
          linkedPartId = match.id;
          stockChanges.push({ id: match.id, delta: -(p.qtyNeeded || 1) });
        }
      }
    }
    if (stockChanges.length > 0) adjustStock(stockChanges);

    const hourlyRate = workshopSettings.defaultHourlyRate || 85;
    const durationMin = apt.estimatedDurationMinutes || 45;
    const laborNetto = Math.round((durationMin / 60) * hourlyRate * 100) / 100;
    const partVKNet = Math.round(partEK * 1.5 * 100) / 100;
    const consumables = 4.0;
    const overhead = 5.0;
    const rawSubtotalNet = laborNetto + partVKNet + consumables + overhead;
    const netto = rawSubtotalNet;
    const taxAmount = Math.round(netto * 0.19 * 100) / 100;
    const brutto = Math.round((netto + taxAmount) * 100) / 100;
    const profit = Math.round((netto - partEK - consumables - overhead) * 100) / 100;

    const newOrder: Order = {
      id: newOrderId,
      cust: apt.customerName,
      phone: apt.phone,
      device: apt.device,
      technician: activeUser?.name || 'Mustafa Al-Zurgany',
      isB2B: false,
      min: durationMin,
      rate: hourlyRate,
      partEK,
      partVKNet,
      consumables,
      overhead,
      express: 0,
      netto,
      taxRate: 19,
      taxAmount,
      brutto,
      profit,
      date: new Date().toLocaleDateString('de-DE'),
      status: '1. Eingang & Registrierung',
      paid: 'Offen',
      payMethod: 'Barzahlung',
      faultDescription: apt.faultDescription,
      linkedPartId,
    };

    setOrders((prev) => [newOrder, ...prev]);
    pushOrder(newOrder);

    // Mark appointment with converted order ID
    updateAppointments(
      appointments.map((a) =>
        a.id === apt.id ? { ...a, convertedOrderId: newOrderId, status: 'in_bearbeitung' as const } : a
      )
    );

    // Switch to orders view so technician sees it immediately
    setActiveTab('orders');
  };

  // Print Handlers
  const handlePrintInvoice = (orderData: Partial<Order>) => {
    const year = new Date().getFullYear();
    const id = orderData.id || `RE-${year}-${Date.now().toString().slice(-5)}`;
    const date = new Date().toLocaleDateString('de-DE');
    const fullOrder = { ...orderData, id, invoiceDate: date, serviceDate: orderData.date || date } as Order;
    setInvoicePrintData(fullOrder);
    setDocPreview({ order: fullOrder, mode: 'invoice' });
  };

  const handlePrintKva = (orderData: Partial<Order>) => {
    const year = new Date().getFullYear();
    const id = (orderData.id || `KVA-${year}-${Date.now().toString().slice(-5)}`).replace(/^RE-/, 'KVA-');
    const date = new Date().toLocaleDateString('de-DE');
    const fullOrder = { ...orderData, id, date: orderData.date || date } as Order;
    setKvaPrintData(fullOrder);
    setDocPreview({ order: fullOrder, mode: 'kva' });
  };

  // Users Handlers
  const handleAddUser = async (user: Omit<User, 'id' | 'createdAt'>, pin: string) => {
    const today = new Date().toLocaleDateString('de-DE');
    const newUser = await withPin(
      { ...user, id: 'U-' + Date.now().toString().slice(-6), createdAt: today },
      pin
    );
    await commitUsers([...users, newUser]);
  };

  const handleUpdateUserPin = async (userId: string, newPin: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const updated = await withPin(target, newPin);
    await commitUsers(users.map((u) => (u.id === userId ? updated : u)));
  };

  const handleToggleUserActive = (userId: string) => {
    commitUsers(users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)));
  };

  const handleDeleteUser = (userId: string) => {
    if (users.find((u) => u.id === userId)?.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      alert('Der letzte Administrator kann nicht gelöscht werden!');
      return;
    }
    commitUsers(users.filter((u) => u.id !== userId));
  };

  // Export CSV
  const handleExportOrdersCsv = () => {
    if (orders.length === 0) {
      alert('Keine Aufträge zum Exportieren!');
      return;
    }
    let csv =
      'Auftrag_ID;Datum;Kunde;Anschrift;Telefon;Geraet;Techniker;Seriennummer;B2B;Status;Zahlung;Netto;Brutto;Gewinn\n';
    orders.forEach((o) => {
      csv += `"${o.id}";"${o.date}";"${o.cust.replace(/"/g, '""')}";"${(o.address || '').replace(/"/g, '""')}";"${o.phone}";"${o.device.replace(/"/g, '""')}";"${o.technician || ''}";"${o.serial || ''}";"${o.isB2B ? 'JA' : 'NEIN'}";"${o.status}";"${o.paid}";"${o.netto.toFixed(2)}";"${o.brutto.toFixed(2)}";"${o.profit.toFixed(2)}"\n`;
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CODE_Auftragsbuch_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#060B0C] text-[#F3F7F7] flex flex-col justify-between selection:bg-[#00F5D4] selection:text-black">
      {/* Lockscreen when locked */}
      <LockScreen
        isLocked={isLocked}
        users={users}
        onUnlock={handleUnlock}
        onResetPin={handleUpdateUserPin}
        onClose={onBackToWebsite}
      />

      <div className="max-w-[1360px] mx-auto w-full px-3.5 sm:px-6 pt-4 sm:pt-6 pb-12 flex-1">
        {/* Header HUD */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-b-2 border-[#C9743F]/25 pb-3 md:pb-4 mb-4 md:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Back to Customer Website Button */}
            <button
              type="button"
              onClick={onBackToWebsite}
              className="p-2.5 rounded-xl bg-[#122225] border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all cursor-pointer flex items-center gap-1.5 font-mono text-xs font-bold shadow-md"
              title="Zurück zur Kunden-Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kunden-Website</span>
            </button>

            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[#10191A] border-2 border-[#C9743F] items-center justify-center font-mono font-black text-xl text-[#00F5D4] shadow-lg shadow-[#00F5D4]/10">
              &lt;/&gt;
            </div>
            <div>
              <h1 className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-1.5">
                CODE<span className="text-[#FF8D4D]">.CALC</span>
              </h1>
              <div className="hidden sm:block text-[11px] font-mono tracking-widest text-[#00F5D4] uppercase">
                // WERKSTATT-KALKULATION, LAGER &amp; BENUTZER
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Logged in Badge */}
            {activeUser && (
              <div
                className={`inline-flex items-center justify-center gap-1.5 min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                  activeUser.role === 'admin'
                    ? 'bg-[#C9743F]/15 border-[#C9743F] text-[#FF8D4D]'
                    : 'bg-[#00F5D4]/15 border-[#00F5D4] text-[#00F5D4]'
                }`}
                title={`Angemeldet als ${activeUser.name} (${activeUser.role})`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline max-w-[120px] truncate">{activeUser.name}</span>
                <span className="hidden sm:inline text-[9px] uppercase px-1 py-0.2 rounded bg-black/40">
                  {activeUser.role}
                </span>
              </div>
            )}

            {/* Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-md"
              aria-label="Einstellungen und Konten"
              title="Benutzerverwaltung &amp; Einstellungen öffnen"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Einstellungen &amp; Konten</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#FF5252]/15 border border-[#FF5252] text-[#FF5252] hover:bg-[#FF5252] hover:text-white transition cursor-pointer shadow-sm shadow-[#FF5252]/10"
              title="Sperren / Abmelden"
              aria-label="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>

            {/* PWA Button */}
            <PWAInstallButton />

            {/* Live Cloud Status Badge (Klickbar zum Neuverbinden / Synchronisieren) */}
            <button
              type="button"
              onClick={() => syncWithCloudflareWorker()}
              aria-label={workerConnected ? 'Cloud verbunden, jetzt abgleichen' : 'Offline, neu verbinden'}
              className={`inline-flex items-center gap-1.5 min-h-10 sm:min-h-0 px-3 py-1 rounded-full text-xs font-mono font-semibold border transition cursor-pointer ${
                workerConnected
                  ? 'bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4] hover:bg-[#00F5D4]/20'
                  : 'bg-[#FF8D4D]/15 border-[#FF8D4D]/40 text-[#FF8D4D] hover:bg-[#FF8D4D]/25'
              }`}
              title={
                workerConnected
                  ? 'Cloudflare D1 Datenbank verbunden (Handy & PC synchronisiert) · Klicken zum Aktualisieren'
                  : 'Aktuell keine Verbindung zur Cloudflare D1 Datenbank · Klicken zum erneuten Verbinden'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  workerConnected ? 'bg-[#00F5D4] animate-pulse' : 'bg-[#FF8D4D]'
                }`}
              />
              <span className="sm:hidden">{workerConnected ? '' : 'Offline'}</span>
              <span className="hidden sm:inline">{workerConnected ? 'Live Cloud' : 'Offline (Neu verbinden)'}</span>
            </button>

            {/* Tools & Export Dropdown (Clean, aufgeräumt & professionell) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="inline-flex items-center justify-center gap-1.5 min-w-10 min-h-10 sm:min-w-0 sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#101D20] border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-sm"
                title="Steuerberater-Export, Backups & CSV"
                aria-label="Export und Tools"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export &amp; Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#080E10] border border-[#00F5D4]/40 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 font-mono text-xs animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTaxOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-[#00F5D4]/10 rounded-lg text-left text-white transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#00F5D4]" />
                    <span>Steuer- &amp; Finanzbericht</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportOrdersCsv();
                      setIsToolsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-[#00F5D4]/10 rounded-lg text-left text-white transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#00F5D4]" />
                    <span>Aufträge CSV (Excel)</span>
                  </button>

                  <div className="h-px bg-white/10 my-0.5" />

                  <button
                    type="button"
                    onClick={() => {
                      const dataBlob = new Blob(
                        [
                          JSON.stringify(
                            { orders, inventory, appointments, users, workshopSettings },
                            null,
                            2
                          ),
                        ],
                        { type: 'application/json' }
                      );
                      const url = URL.createObjectURL(dataBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `CODE_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      setIsToolsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-[#00F5D4]/10 rounded-lg text-left text-white transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FF8D4D]" />
                    <span>JSON-Backup sichern</span>
                  </button>

                  <label className="flex items-center gap-2 p-2 hover:bg-[#00F5D4]/10 rounded-lg text-left text-white transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#FF8D4D]" />
                    <span>JSON-Backup einspielen</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const imported = JSON.parse(event.target?.result as string);
                            const data = Array.isArray(imported) ? { orders: imported } : imported;
                            if (data.orders || data.inventory || data.users || data.appointments) {
                              // Backup auch in die Cloud schreiben, sonst holt der nächste Abgleich den alten Stand zurück
                              if (Array.isArray(data.orders)) {
                                setOrders(data.orders);
                                data.orders.forEach((o: Order) => pushOrder(o));
                              }
                              if (Array.isArray(data.inventory)) {
                                setInventory(data.inventory);
                                pushInventory(data.inventory);
                              }
                              if (Array.isArray(data.appointments)) updateAppointments(data.appointments);
                              if (Array.isArray(data.users) && data.users.length > 0) commitUsers(data.users);
                              if (data.workshopSettings) commitSettings({ ...DEFAULT_WORKSHOP_SETTINGS, ...data.workshopSettings });
                              alert('Backup wiederhergestellt und in die Cloud übertragen.');
                            } else {
                              alert('Ungültiges Datenformat!');
                            }
                          } catch {
                            alert('Fehler beim Lesen der JSON-Datei!');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                        setIsToolsMenuOpen(false);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Navigation Tabs with Shortcut Badges */}
        <nav className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            title="Cockpit anzeigen (Tastatur: Strg+1 oder Alt+1)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>📊 Dashboard</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+1
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            title="Kalkulator & Neuanlage (Tastatur: Strg+2 oder Alt+2)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'calc'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>⚡ 1. Kalkulator</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+2
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            title="Auftragsbuch öffnen (Tastatur: Strg+3 oder Alt+3)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>📋 2. Aufträge ({orders.length})</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+3
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            title="Termine & Vorbereitung (Tastatur: Strg+4 oder Alt+4)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#FF8D4D]" />
            <span>📅 3. Termine &amp; Vorbereitung ({appointments.filter((a) => a.status !== 'erledigt' && a.status !== 'storniert').length})</span>
            {appointments.some((a) => a.date === new Date().toISOString().split('T')[0] && a.status !== 'storniert') && (
              <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
            )}
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+4
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            title="Ersatzteil-Lager öffnen (Tastatur: Strg+5 oder Alt+5)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>📦 4. Lager ({inventory.length})</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+5
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            title="Statistik & Bilanzen (Tastatur: Strg+6 oder Alt+6)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>📈 5. Statistik</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+6
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_diagnose')}
            title="KI-Techniker Diagnose (Tastatur: Strg+7 oder Alt+7)"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_diagnose'
                ? 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/10'
                : 'text-[#859B9E] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Bot className="w-4 h-4 text-[#00F5D4]" />
            <span>🔬 6. KI-Diagnose</span>
            <kbd className="hidden lg:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-70 font-mono">
              Strg+7
            </kbd>
          </button>
        </nav>

        {/* Tab Content */}
        <main>
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              inventory={inventory}
              currentUser={activeUser}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'calc' && (
            <CalculatorView
              inventory={inventory}
              onSaveOrder={handleSaveOrder}
              onPrintInvoice={handlePrintInvoice}
              onPrintKva={handlePrintKva}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              currentUser={activeUser}
              onChangeStatus={handleChangeOrderStatus}
              onTogglePaid={handleTogglePaid}
              onDeleteOrder={handleDeleteOrder}
              onPrintInvoice={handlePrintInvoice}
              onPrintKva={handlePrintKva}
              onRequestAdminAuth={(req) => setAdminRequest(req)}
              onOpenWhatsApp={(o) => setWaOrder(o)}
              onOpenLabel={(o) => setLabelOrder(o)}
              onOpenPhotos={(o) => setPhotosOrder(o)}
              onOpenSignature={(o) => setSigOrder(o)}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              inventory={inventory}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onConvertToOrder={handleConvertAppointmentToOrder}
              onOpenSupplierModal={() => setIsSupplierOpen(true)}
              onClearAllAppointments={activeUser?.role === 'admin' ? handleClearAllAppointments : undefined}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              currentUser={activeUser}
              onAddPart={handleAddPart}
              onAdjustStock={handleAdjustStock}
              onDeletePart={handleDeletePart}
              onRequestAdminAuth={(req) => setAdminRequest(req)}
              onOpenSupplierOrder={() => setIsSupplierOpen(true)}
              onClearAllInventory={activeUser?.role === 'admin' ? handleClearAllInventory : undefined}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView orders={orders} />}

          {activeTab === 'ai_diagnose' && (
            <AiTechnicianWorkerView
              onApplyToCalculator={() => {
                setActiveTab('calc');
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-[11px] font-mono text-[#859B9E]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{workshopSettings.workshopName}</strong> • {workshopSettings.ownerName} • {workshopSettings.address}
          </div>
          <div className="flex items-center gap-3">
            <span>Stand: {new Date().getFullYear()}</span>
            <span>•</span>
            <span className="text-[#00F5D4]">{workshopSettings.website}</span>
            <span>•</span>
            <span>Tel: {workshopSettings.phone}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={activeUser}
        users={users}
        onAddUser={handleAddUser}
        onUpdateUserPin={handleUpdateUserPin}
        onToggleUserActive={handleToggleUserActive}
        onDeleteUser={handleDeleteUser}
        workshopSettings={workshopSettings}
        onSaveWorkshopSettings={commitSettings}
        onClearAllAppointments={handleClearAllAppointments}
        onClearAllInventory={handleClearAllInventory}
        onClearAllOrders={handleClearAllOrders}
      />

      <TaxModal
        isOpen={isTaxOpen}
        onClose={() => setIsTaxOpen(false)}
        orders={orders}
        onPrintReport={(payload) => {
          setTaxReportPrintData(payload);
          setTimeout(() => {
            document.body.classList.add('print-mode-tax');
            try {
              window.print();
            } catch (err) {
              console.warn('Druck-Dialog konnte nicht direkt aufgerufen werden:', err);
            }
            setTimeout(() => {
              document.body.classList.remove('print-mode-tax');
            }, 1500);
          }, 200);
        }}
      />

      <AdminConfirmModal
        request={adminRequest}
        users={users}
        onClose={() => setAdminRequest(null)}
      />

      <WhatsAppModal
        isOpen={!!waOrder}
        onClose={() => setWaOrder(null)}
        order={waOrder}
        workshopSettings={workshopSettings}
      />

      <DeviceLabelModal
        isOpen={!!labelOrder}
        onClose={() => setLabelOrder(null)}
        order={labelOrder}
        workshopSettings={workshopSettings}
      />

      <OrderPhotosModal
        isOpen={!!photosOrder}
        onClose={() => setPhotosOrder(null)}
        order={photosOrder}
        onSavePhotos={(orderId, photos) => {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, photos } : o)));
        }}
      />

      <CustomerSignatureModal
        isOpen={!!sigOrder}
        onClose={() => setSigOrder(null)}
        order={sigOrder}
        workshopSettings={workshopSettings}
        onSaveSignature={(orderId, customerSignature) => {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, customerSignature } : o)));
        }}
      />

      <SupplierOrderModal
        isOpen={isSupplierOpen}
        onClose={() => setIsSupplierOpen(false)}
        inventory={inventory}
        workshopSettings={workshopSettings}
      />

      <InvoicePreviewModal
        isOpen={!!docPreview}
        onClose={() => setDocPreview(null)}
        order={docPreview ? docPreview.order : null}
        mode={docPreview ? docPreview.mode : 'invoice'}
        workshopSettings={workshopSettings}
      />

      {/* Hidden print templates */}
      <PrintTemplates
        invoiceData={invoicePrintData}
        kvaData={kvaPrintData}
        taxReportData={taxReportPrintData}
      />

      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-black px-4 py-2 text-xs font-mono font-bold shadow-2xl backdrop-blur-md animate-bounce">
          <WifiOff className="w-4 h-4" />
          <span>Offline-Modus — Lokaler Speicher &amp; PWA-Cache aktiv</span>
        </div>
      )}
    </div>
  );
};
