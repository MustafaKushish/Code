export interface OrderPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
}

export interface Order {
  id: string;
  cust: string;
  phone: string;
  address?: string;
  device: string;
  serial?: string;
  technician?: string;
  isB2B?: boolean;
  b2bDiscountPercent?: number;
  b2bDiscountVal?: number;
  rawSubtotalNet?: number;
  min: number;
  rate: number;
  partEK: number;
  partVKNet: number;
  consumables: number;
  overhead: number;
  express: number;
  netto: number;
  taxRate: number;
  taxAmount: number;
  brutto: number;
  profit: number;
  date: string;
  invoiceDate?: string;
  serviceDate?: string;
  isoDate?: string;
  status: 'Eingegangen' | 'In Arbeit' | 'Fertig / Test' | 'Abgeschlossen' | string;
  paid: 'Bezahlt' | 'Offen' | string;
  payMethod?: string;
  newPrice?: number;
  linkedPartId?: string;
  photos?: OrderPhoto[];
  customerSignature?: string;
  faultDescription?: string;
  accessories?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  minQty: number;
  ek: number;
  supplier?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  /** Nur noch für alte Konten; neue PINs liegen als pinHash + pinSalt vor */
  pin?: string;
  pinHash?: string;
  pinSalt?: string;
  role: 'admin' | 'techniker' | 'buchhaltung';
  createdAt: string;
  active?: boolean;
  canSettleInvoices?: boolean;
  canDelete?: boolean;
}

export interface WorkshopSettings {
  workshopName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  defaultHourlyRate: number;
}

export interface AdminAuthRequest {
  type: 'SETTLE_INVOICE' | 'DELETE_ORDER' | 'DELETE_PART' | string;
  title: string;
  description: string;
  itemDetails: string;
  requiredRole: 'admin' | 'buchhaltung_or_admin';
  onConfirm: () => void;
}

export interface TaxReportPayload {
  periodLabel: string;
  printDate: string;
  grossTotal: number;
  net19Total: number;
  vat19Total: number;
  net0Total: number;
  partEKTotal: number;
  profitTotal: number;
  items: Order[];
}

export interface AppointmentRequiredPart {
  partName: string;
  inventoryId?: string;
  qtyNeeded: number;
}

export interface Appointment {
  id: string; // e.g. "TERM-201"
  customerName: string;
  phone: string;
  email?: string;
  device: string;
  faultDescription: string;
  serviceType?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'bestaetigt' | 'teile_fehlen' | 'in_bearbeitung' | 'erledigt' | 'storniert';
  requiredParts: AppointmentRequiredPart[];
  estimatedDurationMinutes?: number;
  internalNotes?: string;
  convertedOrderId?: string;
  createdAt?: string;
}
