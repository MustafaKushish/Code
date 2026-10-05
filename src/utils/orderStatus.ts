export interface UnifiedStep {
  step: number;
  key: string;
  label: string;
  shortLabel: string;
  defaultStatusText: string;
}

export const UNIFIED_STEPS: UnifiedStep[] = [
  {
    step: 1,
    key: 'EINGANG',
    label: '1. Eingang & Registrierung',
    shortLabel: 'Eingang & Registrierung',
    defaultStatusText: 'Gerät digital erfasst, Sicherheits-Etikett mit QR-Code gedruckt und der Werkbank zugewiesen.',
  },
  {
    step: 2,
    key: 'DIAGNOSE',
    label: '2. Labor-Diagnose',
    shortLabel: 'Labor-Diagnose',
    defaultStatusText: 'Mikroskopische 40x Sichtprüfung, Diodenmessung der Hauptschienen & Fehlerursachen-Lokalisierung.',
  },
  {
    step: 3,
    key: 'REPARATUR',
    label: '3. Reparatur & Bearbeitung',
    shortLabel: 'Reparatur & Bearbeitung',
    defaultStatusText: 'Mikrolöten, Chiptausch (BGA/QFN), Leiterbahnrekonstruktion und chemische Reinigung in Bearbeitung.',
  },
  {
    step: 4,
    key: 'TEST',
    label: '4. Qualitätsprüfung & Test',
    shortLabel: 'Qualitätsprüfung & Test',
    defaultStatusText: 'Elektrische Messtests, Oszilloskop-Signaltest, Dauervolllast und thermografische Endkontrolle.',
  },
  {
    step: 5,
    key: 'ABHOLBEREIT',
    label: '5. Fertig & Abholbereit',
    shortLabel: 'Fertig & Abholbereit',
    defaultStatusText: 'Reparatur erfolgreich abgeschlossen & versiegelt. Dein Gerät liegt ab sofort zur Abholung bereit!',
  },
];

/**
 * Normalizes any status string into a step number from 1 to 5.
 */
export function getStepNumber(statusText: string | undefined): number {
  if (!statusText) return 1;
  const s = statusText.toLowerCase();
  if (s.includes('5') || s.includes('abhol') || s.includes('abgeschlossen') || s.includes('fertiggestellt')) {
    return 5;
  }
  if (s.includes('4') || s.includes('test') || s.includes('stresstest') || s.includes('prüfung')) {
    return 4;
  }
  if (s.includes('3') || s.includes('arbeit') || s.includes('löt') || s.includes('reparatur') || s.includes('bearbeitung')) {
    return 3;
  }
  if (s.includes('2') || s.includes('diagnose') || s.includes('mikroskop') || s.includes('check')) {
    return 2;
  }
  return 1;
}

/**
 * Returns the exact label matching the step (e.g. "5. Fertig & Abholbereit")
 */
export function getStepLabel(step: number): string {
  const found = UNIFIED_STEPS.find((s) => s.step === step);
  return found ? found.label : UNIFIED_STEPS[0].label;
}

/**
 * Generates an official WhatsApp notification link for completed pickup orders.
 */
export function getWhatsAppPickupUrl(order: {
  id: string;
  cust?: string;
  customer?: string;
  phone?: string;
  device?: string;
}): string {
  const custName = order.cust || order.customer || 'Kunde';
  const deviceName = order.device || 'Gerät';
  let cleanPhone = (order.phone || '').replace(/\D/g, '');

  if (cleanPhone.startsWith('0')) {
    cleanPhone = '49' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('49') && cleanPhone.length > 0) {
    cleanPhone = '49' + cleanPhone;
  }

  // Fallback to workshop phone if empty
  if (!cleanPhone) cleanPhone = '4917641744443';

  const text = `Hallo ${custName}, gute Nachrichten von der CODE IT-Werkstatt Neumarkt! 🛠️

Dein Reparaturauftrag ${order.id} für dein Gerät "${deviceName}" ist erfolgreich fertiggestellt und durch alle Qualitäts- und Belastungstests gelaufen.

Das Gerät liegt ab sofort zur Abholung für dich bereit!

📍 Werkstatt-Standort:
92318 Neumarkt in der Oberpfalz (Übergabe nach Terminabsprache)
⏰ Öffnungszeiten: Mo–Fr 09:00–18:00 Uhr | Sa nach Vereinbarung

Wir freuen uns auf deinen Besuch!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
