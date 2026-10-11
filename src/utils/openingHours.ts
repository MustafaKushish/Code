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

import { msg } from '../i18n';

type Translate = (german: string, vars?: Record<string, string | number>) => string;

const DAY_NAMES = [msg('So'), msg('Mo'), msg('Di'), msg('Mi'), msg('Do'), msg('Fr'), msg('Sa')];

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

/** z. B. { open: true, label: "Jetzt geöffnet · bis 18:00 Uhr" } – t übersetzt den Text */
export function getOpeningStatus(t: Translate, date = new Date()): OpeningStatus {
  const { day, minutes } = berlinNow(date);
  const today = HOURS[day];
  if (today && minutes >= today[0] && minutes < today[1]) {
    return { open: true, label: t('Jetzt geöffnet · bis {time} Uhr', { time: fmt(today[1]) }) };
  }
  if (today && minutes < today[0]) {
    return { open: false, label: t('Geschlossen · öffnet heute {time} Uhr', { time: fmt(today[0]) }) };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = HOURS[d];
    if (next) {
      return {
        open: false,
        label:
          i === 1
            ? t('Geschlossen · öffnet morgen {time} Uhr', { time: fmt(next[0]) })
            : t('Geschlossen · öffnet {day} {time} Uhr', { day: t(DAY_NAMES[d]), time: fmt(next[0]) }),
      };
    }
  }
  return { open: false, label: t('Termin nach Vereinbarung') };
}
