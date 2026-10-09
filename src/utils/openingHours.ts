// Öffnungszeiten der Werkstatt (wie in index.html / Kontaktbereich)
// 0 = Sonntag … 6 = Samstag; Zeiten in Minuten nach Mitternacht (Europe/Berlin)
const HOURS: Record<number, [number, number] | null> = {
  0: null,
  1: [600, 1080],
  2: [600, 1080],
  3: [600, 1080],
  4: [600, 1080],
  5: [600, 1080],
  6: [600, 840],
};

const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function berlinNow(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export interface OpeningStatus {
  open: boolean;
  label: string;
}

/** z. B. { open: true, label: "Jetzt geöffnet · bis 18:00" } */
export function getOpeningStatus(date = new Date()): OpeningStatus {
  const { day, minutes } = berlinNow(date);
  const today = HOURS[day];
  if (today && minutes >= today[0] && minutes < today[1]) {
    return { open: true, label: `Jetzt geöffnet · bis ${fmt(today[1])} Uhr` };
  }
  if (today && minutes < today[0]) {
    return { open: false, label: `Geschlossen · öffnet heute ${fmt(today[0])} Uhr` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = HOURS[d];
    if (next) {
      return { open: false, label: `Geschlossen · öffnet ${i === 1 ? 'morgen' : DAY_NAMES[d]} ${fmt(next[0])} Uhr` };
    }
  }
  return { open: false, label: 'Termin nach Vereinbarung' };
}
