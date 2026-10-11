import { User } from './types';

// PINs werden nur als PBKDF2-Hash gespeichert (pro Benutzer eigenes Salz).
// Ältere Konten mit Klartext-PIN werden beim Start automatisch umgestellt.
const PBKDF2_ITERATIONS = 120_000;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function newSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: PBKDF2_ITERATIONS },
    key,
    256
  );
  return toHex(new Uint8Array(bits));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Gibt den Benutzer mit gehashter PIN zurück (ohne Klartext-Feld). */
export async function withPin(user: User, pin: string): Promise<User> {
  const pinSalt = newSalt();
  const pinHash = await hashPin(pin, pinSalt);
  const { pin: _legacy, ...rest } = user;
  return { ...rest, pinHash, pinSalt };
}

export async function verifyPin(user: User, pin: string): Promise<boolean> {
  if (user.pinHash && user.pinSalt) {
    return safeEqual(await hashPin(pin, user.pinSalt), user.pinHash);
  }
  return typeof user.pin === 'string' && user.pin.length > 0 && safeEqual(user.pin, pin);
}

export function hasLegacyPin(users: User[]): boolean {
  return users.some((u) => typeof u.pin === 'string' && !u.pinHash);
}

/** Stellt alle Klartext-PINs auf Hashes um. */
export async function migrateLegacyPins(users: User[]): Promise<User[]> {
  return Promise.all(users.map((u) => (typeof u.pin === 'string' && !u.pinHash ? withPin(u, u.pin) : u)));
}

/** Für sessionStorage und Anzeige: niemals PIN oder Hash mitgeben. */
export function publicUser(user: User): User {
  const { pin: _pin, pinHash: _hash, pinSalt: _salt, ...rest } = user;
  return rest;
}

export const MIN_PIN_LENGTH = 4;
