import { User, WorkshopSettings } from './types';

// Erstes Konto auf einem neuen Gerät. Die Standard-PIN wird beim Start gehasht und sollte
// direkt unter Einstellungen geändert werden. Demo-Aufträge gibt es bewusst nicht mehr,
// damit keine erfundenen Kunden in Statistik, Steuerbericht oder Cloudflare landen.
export const DEFAULT_USERS: User[] = [
  {
    id: 'U-ADMIN',
    name: 'Mustafa Al-Zurgany',
    username: 'admin',
    pin: '2026',
    role: 'admin',
    createdAt: '01.01.2026',
    active: true,
    canSettleInvoices: true,
    canDelete: true,
  },
];

export const DEFAULT_WORKSHOP_SETTINGS: WorkshopSettings = {
  workshopName: 'CODE // IT-Werkstatt',
  ownerName: 'Mustafa Al-Zurgany',
  address: '92318 Neumarkt in der Oberpfalz',
  phone: '0176 4174 4443',
  email: 'info@code-ger.com',
  website: 'www.code-ger.de',
  defaultHourlyRate: 85,
};
