// Cal.com-Terminbuchung: Das Cal.com-Skript wird erst nach einem Klick auf "Termin" geladen.
// Vorher fließen keine Daten an Cal.com (DSGVO). Klappt das Laden nicht, öffnet sich die Buchungsseite direkt.

export const CAL_LINK = 'mustafa-al-zurgany-cfwhg8/code-werkstatt';
const CAL_ORIGIN = 'https://cal.com';
const EMBED_SRC = 'https://app.cal.com/embed/embed.js';

type CalFn = ((...args: unknown[]) => void) & { q?: unknown[][]; loaded?: boolean; ns?: Record<string, unknown> };

declare global {
  interface Window {
    Cal?: CalFn;
  }
}

let loadPromise: Promise<void> | null = null;

function loadEmbed(): Promise<void> {
  if (loadPromise) return loadPromise;

  // Warteschlange wie im offiziellen Snippet: Aufrufe vor dem Laden werden danach abgearbeitet
  const cal: CalFn = window.Cal || (((...args: unknown[]) => {
    (cal.q = cal.q || []).push(args);
  }) as CalFn);
  cal.ns = cal.ns || {};
  cal.loaded = true;
  window.Cal = cal;

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = EMBED_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Cal.com nicht erreichbar'));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error('Cal.com Zeitüberschreitung')), 8000);
  });

  cal('init', { origin: CAL_ORIGIN });
  cal('ui', {
    theme: 'dark',
    styles: { branding: { brandColor: '#00F5D4' } },
    hideEventTypeDetails: false,
    layout: 'month_view',
  });

  return loadPromise;
}

export function openBooking(calLink = CAL_LINK) {
  const fallbackUrl = `${CAL_ORIGIN}/${calLink}`;
  loadEmbed()
    .then(() => {
      window.Cal?.('modal', { calLink, calOrigin: CAL_ORIGIN, config: { layout: 'month_view', theme: 'dark' } });
    })
    .catch(() => {
      loadPromise = null;
      window.location.href = fallbackUrl;
    });
}

/** Ein Klick auf ein Element mit data-booking-link öffnet die Terminbuchung. */
export function installBookingLinks() {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-booking-link]');
    if (!el) return;
    e.preventDefault();
    openBooking(el.dataset.bookingLink || CAL_LINK);
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
