import React, { useState, useEffect } from 'react';
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
import {
  DEFAULT_USERS,
  DEFAULT_WORKSHOP_SETTINGS,
  DEFAULT_INVENTORY,
  INITIAL_DEMO_ORDERS,
  DEFAULT_APPOINTMENTS,
} from './defaultData';
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
  CLOUDFLARE_WORKER_URL,
} from '../services/cloudflareSync';

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
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_USERS[0];
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
      return stored ? JSON.parse(stored) : INITIAL_DEMO_ORDERS;
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  });

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = localStorage.getItem('code_appointments_v1');
      return stored ? JSON.parse(stored) : DEFAULT_APPOINTMENTS;
    } catch {
      return DEFAULT_APPOINTMENTS;
    }
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('code_inventory_v1');
      return stored ? JSON.parse(stored) : DEFAULT_INVENTORY;
    } catch {
      return DEFAULT_INVENTORY;
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

  // Cloudflare Worker Sync (https://code-techniker.mustafa-alzurgany.workers.dev/api/orders)
  const [workerConnected, setWorkerConnected] = useState(true);

  // Silent Background Sync: Compares data and avoids any unnecessary re-renders or UI flickering
  const syncWithCloudflareWorker = async () => {
    try {
      const result = await fetchFromCloudflare();
      if (result.success) {
        setWorkerConnected(true);

        // 1. ORDERS SYNC: Cloudflare D1 database is the single source of truth
        if (result.orders.length > 0) {
          setOrders((prev) => {
            const prevSig = prev.map((o) => `${o.id}_${o.status}_${o.paid}_${o.cust}_${o.brutto}`).join('|');
            const nextSig = result.orders.map((o) => `${o.id}_${o.status}_${o.paid}_${o.cust}_${o.brutto}`).join('|');
            return prevSig === nextSig ? prev : result.orders;
          });
        }

        // 2. INVENTORY SYNC: Cloudflare D1 (accepts [] as valid empty inventory)
        if (result.inventory !== null && Array.isArray(result.inventory)) {
          setInventory((prev) => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(result.inventory);
            return prevStr === nextStr ? prev : result.inventory!;
          });
        }

        // 3. APPOINTMENTS SYNC: Cloudflare D1 (accepts [] as valid empty appointments)
        if (result.appointments !== null && Array.isArray(result.appointments)) {
          setAppointments((prev) => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(result.appointments);
            return prevStr === nextStr ? prev : result.appointments!;
          });
        }
      } else {
        setWorkerConnected(false);
      }
    } catch {
      setWorkerConnected(false);
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
    setActiveUser(user);
    sessionStorage.setItem('code_active_user', JSON.stringify(user));
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
      setInventory((prev) => {
        const nextInv = prev.map((item) =>
          item.id === linkedPartId ? { ...item, qty: Math.max(0, item.qty - 1) } : item
        );
        saveInventoryToCloudflare(nextInv);
        return nextInv;
      });
    }

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== id)]);
    setActiveTab('orders');

    // Immediately save complete order to Cloudflare Worker D1
    saveOrderToCloudflare(newOrder);
  };

  const handleChangeOrderStatus = (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    // Remote update on Cloudflare Worker D1
    updateOrderStatusInCloudflare(id, status);
  };

  const handleTogglePaid = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const next = o.paid === 'Bezahlt' ? 'Offen' : 'Bezahlt';
          const updated = { ...o, paid: next };
          // Remote save to Cloudflare D1
          saveOrderToCloudflare(updated);
          return updated;
        }
        return o;
      })
    );
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));

    // Remote delete on Cloudflare Worker D1
    deleteOrderFromCloudflare(id);
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
    saveInventoryToCloudflare(nextInv);
  };

  const handleAdjustStock = (id: string, delta: number) => {
    const nextInv = inventory.map((item) =>
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    );
    setInventory(nextInv);
    saveInventoryToCloudflare(nextInv);
  };

  const handleDeletePart = (id: string) => {
    const nextInv = inventory.filter((p) => p.id !== id);
    setInventory(nextInv);
    saveInventoryToCloudflare(nextInv);
  };

  const handleClearAllInventory = () => {
    setInventory([]);
    saveInventoryToCloudflare([]);
  };

  // Appointment Handlers
  const handleAddAppointment = (apt: Appointment) => {
    setAppointments((prev) => {
      const next = [apt, ...prev];
      saveAppointmentsToCloudflare(next);
      return next;
    });
  };

  const handleUpdateAppointment = (apt: Appointment) => {
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === apt.id ? apt : a));
      saveAppointmentsToCloudflare(next);
      return next;
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAppointmentsToCloudflare(next);
      return next;
    });
  };

  const handleClearAllAppointments = () => {
    setAppointments([]);
    saveAppointmentsToCloudflare([]);
  };

  const handleClearAllOrders = async () => {
    for (const o of orders) {
      await deleteOrderFromCloudflare(o.id);
    }
    setOrders([]);
  };

  const handleRestoreDemoData = async () => {
    setOrders(INITIAL_DEMO_ORDERS);
    setInventory(DEFAULT_INVENTORY);
    setAppointments(DEFAULT_APPOINTMENTS);
    for (const o of INITIAL_DEMO_ORDERS) {
      await saveOrderToCloudflare(o);
    }
    await saveInventoryToCloudflare(DEFAULT_INVENTORY);
    await saveAppointmentsToCloudflare(DEFAULT_APPOINTMENTS);
  };

  const handleConvertAppointmentToOrder = (apt: Appointment) => {
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `CODE-${nextNum}`;

    // Calculate parts EK if matched and deduct from stock
    let partEK = 0;
    let linkedPartId: string | undefined = undefined;
    if (apt.requiredParts && apt.requiredParts.length > 0) {
      for (const p of apt.requiredParts) {
        const match = inventory.find(
          (i) => i.id === p.inventoryId || i.name.toLowerCase().includes(p.partName.toLowerCase())
        );
        if (match) {
          partEK += (match.ek || 0) * (p.qtyNeeded || 1);
          linkedPartId = match.id;
          handleAdjustStock(match.id, -(p.qtyNeeded || 1));
        }
      }
    }

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
    saveOrderToCloudflare(newOrder);

    // Mark appointment with converted order ID
    setAppointments((prev) => {
      const next = prev.map((a) => (a.id === apt.id ? { ...a, convertedOrderId: newOrderId, status: 'in_bearbeitung' as const } : a));
      saveAppointmentsToCloudflare(next);
      return next;
    });

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
  const handleAddUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const today = new Date().toLocaleDateString('de-DE');
    const newUser: User = {
      ...user,
      id: 'U-' + Date.now().toString().slice(-6),
      createdAt: today,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const handleUpdateUserPin = (userId: string, newPin: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, pin: newPin } : u)));
    if (activeUser?.id === userId) {
      const updated = { ...activeUser, pin: newPin };
      setActiveUser(updated);
      sessionStorage.setItem('code_active_user', JSON.stringify(updated));
    }
  };

  const handleToggleUserActive = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)));
  };

  const handleDeleteUser = (userId: string) => {
    if (users.find((u) => u.id === userId)?.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      alert('Der letzte Administrator kann nicht gelöscht werden!');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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
        onClose={onBackToWebsite}
      />

      <div className="max-w-[1360px] mx-auto w-full px-3.5 sm:px-6 pt-4 sm:pt-6 pb-12 flex-1">
        {/* Header HUD */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#C9743F]/25 pb-4 mb-6">
          <div className="flex items-center gap-3.5">
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

            <div className="w-12 h-12 rounded-xl bg-[#10191A] border-2 border-[#C9743F] flex items-center justify-center font-mono font-black text-xl text-[#00F5D4] shadow-lg shadow-[#00F5D4]/10">
              &lt;/&gt;
            </div>
            <div>
              <h1 className="font-mono text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-1.5">
                CODE<span className="text-[#FF8D4D]">.CALC</span>
              </h1>
              <div className="text-[11px] font-mono tracking-widest text-[#00F5D4] uppercase">
                // WERKSTATT-KALKULATION, LAGER &amp; BENUTZER
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Logged in Badge */}
            {activeUser && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                  activeUser.role === 'admin'
                    ? 'bg-[#C9743F]/15 border-[#C9743F] text-[#FF8D4D]'
                    : 'bg-[#00F5D4]/15 border-[#00F5D4] text-[#00F5D4]'
                }`}
                title={`Angemeldet als ${activeUser.name} (${activeUser.role})`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{activeUser.name}</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-black/40">
                  {activeUser.role}
                </span>
              </div>
            )}

            {/* Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-md"
              title="Benutzerverwaltung &amp; Einstellungen öffnen"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Einstellungen &amp; Konten</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#FF5252]/15 border border-[#FF5252] text-[#FF5252] hover:bg-[#FF5252] hover:text-white transition cursor-pointer shadow-sm shadow-[#FF5252]/10"
              title="Sperren / Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Abmelden</span>
            </button>

            {/* PWA Button */}
            <PWAInstallButton />

            {/* Live Cloud Status Badge (Klickbar zum Neuverbinden / Synchronisieren) */}
            <button
              type="button"
              onClick={() => syncWithCloudflareWorker()}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border transition cursor-pointer ${
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
              <span>{workerConnected ? 'Live Cloud' : 'Offline (Neu verbinden)'}</span>
            </button>

            {/* Tools & Export Dropdown (Clean, aufgeräumt & professionell) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#101D20] border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-sm"
                title="Steuerberater-Export, Backups & CSV"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Export &amp; Tools</span>
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
                            { orders, inventory, users, workshopSettings },
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
                            if (Array.isArray(imported)) {
                              setOrders(imported);
                              alert('Aufträge erfolgreich wiederhergestellt!');
                            } else if (imported.orders || imported.inventory || imported.users) {
                              if (Array.isArray(imported.orders)) setOrders(imported.orders);
                              if (Array.isArray(imported.inventory)) setInventory(imported.inventory);
                              if (Array.isArray(imported.users)) setUsers(imported.users);
                              if (imported.workshopSettings) setWorkshopSettings(imported.workshopSettings);
                              alert('Vollständiges Backup (Aufträge, Lager & Benutzer) wiederhergestellt!');
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
              onClearAllAppointments={handleClearAllAppointments}
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
              onClearAllInventory={handleClearAllInventory}
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
        onSaveWorkshopSettings={(s) => setWorkshopSettings(s)}
        onClearAllAppointments={handleClearAllAppointments}
        onClearAllInventory={handleClearAllInventory}
        onClearAllOrders={handleClearAllOrders}
        onRestoreDemoData={handleRestoreDemoData}
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
