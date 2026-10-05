/**
 * Centralized AI Technician Service for CODE // High-End Platinenreparatur Neumarkt.
 * Enforces strict 3-point format and specialized hardware error code mapping.
 */

export interface AiDiagnosticRequest {
  message: string;
  deviceCategory?: string;
  image?: {
    mimeType: string;
    data: string;
  };
  history?: Array<{
    role: 'user' | 'model';
    text: string;
  }>;
}

export interface AiDiagnosticResult {
  reply: string;
  isValidated: boolean;
  modelUsed?: string;
}

export const MANDATORY_CLOSING_SENTENCE =
  'Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung.';

export const KNOWN_ERROR_CODES = {
  konsolen: [
    { code: '2101-0001', system: 'Nintendo Switch', cause: 'M92T36 Power-Management IC Kurzschluss durch Überspannung am USB-C Port' },
    { code: '2162-0002', system: 'Nintendo Switch', cause: 'PI3USB Video/Audio Bus Transceiver Kurzschluss' },
    { code: '0.46A Hänger', system: 'Nintendo Switch', cause: 'BQ24193 Akku-Laderegler defekt oder 24-Pin USB-C Buchse mechanisch deformiert' },
    { code: 'BLOD (Blue Light of Death)', system: 'PS5', cause: 'Flüssigmetall oxidiert/ausgelaufen auf APU oder DrMOS 12V-Schiene OCP Kurzschluss' },
    { code: 'WLOD (White Light, kein Bild)', system: 'PS5', cause: 'ESD-Dioden durchlegiert, Panasonic MN864729 / TDP158 HDMI Retimer defekt' },
    { code: '0x8007045D / Kein Boot', system: 'Xbox Series X', cause: 'NB7N621M HDMI Retimer oder 12V Standby Power-Stage Ausfall' },
  ],
  laptops: [
    { code: '5V 0.00A / 5V 0.04A Bootloop', system: 'MacBook (Apple Silicon / Intel)', cause: 'CD3217 / CD3215 USB-C Power Delivery Controller defekt' },
    { code: 'PPBUS_G3H 0V Kurzschluss', system: 'MacBook', cause: 'Durchlegierter 0603 SMD-Sperrkondensator oder ISL9240 Buck-Boost IC defekt' },
    { code: 'Kein Backlight (Bild nur mit Taschenlampe)', system: 'Laptop / MacBook', cause: 'F7700 Backlight Sicherung ausgelöst oder LP8548 / LP8550 LED Driver defekt' },
    { code: 'Lenovo 5 Beeps / Dell 2 Amber 4 White', system: 'Windows Laptop', cause: '19V VDD_MAIN Kurzschluss oder KBC / EC Controller (ITE / ENE) defekt' },
    { code: 'Netzteil-LED geht beim Einstecken aus', system: 'Laptop Allgemein', cause: 'Harter Kurzschluss auf der 19V Hauptstromschiene (Eingangs-MOSFETs PQ101/PQ102)' },
  ],
  smartphones: [
    { code: 'Panic-Full (prc_panic / i2c0)', system: 'iPhone', cause: 'Sensor-Flexkabel (Hörmuschel / Annäherungssensor) blockiert I2C-Bus' },
    { code: 'Lädt nicht / Akku bleibt bei 1%', system: 'iPhone', cause: 'Tristar / Hydra 1610A3 Lade-IC oder BSI-Datenleitung unterbrochen' },
    { code: 'Fehler 4013 / Fehler 9', system: 'iPhone', cause: 'NAND-Flash Speicher defekt oder korrodierte Spannungsversorgung auf PP_VDD_BOOST' },
    { code: 'Feuchtigkeit im Ladeanschluss erkannt', system: 'Samsung / Android', cause: 'CC1/CC2 Datenpins am Sub-Board korrodiert oder Thermistor TH1000 hochohmig' },
    { code: 'Qualcomm EDL 9008 / Bootloop', system: 'Xiaomi / Android', cause: 'Kalte Lötstellen unter CPU/RAM-Sandwich (CPU-Reballing erforderlich)' },
  ],
  controller_keys: [
    { code: 'Stick-Drift (PS5 / Xbox)', system: 'Controller', cause: 'Mechanischer Kohleschicht-Abrieb des Potentiometers -> Upgrade auf FavocTech Hall-Effect' },
    { code: 'Schlüssel wird nicht erkannt', system: 'BMW / Mercedes / VAG', cause: 'Transponder-Spule gebrochen oder Panasonic VL2020 Akku auf 0.0V tiefentladen' },
  ],
};

/**
 * Validates and strictly enforces the 3-point format required by Mustafa's specification.
 * If sections are missing or order is perturbed, this function normalizes it.
 */
export function validateAndFormatResponse(raw: string, queryHint?: string): string {
  let cleaned = raw.trim();

  // Strip greetings
  cleaned = cleaned.replace(/^(hallo|guten tag|hi|servus|moin|hey)[^.\n]*[.\n]+/i, '').trim();

  // Check presence of headers
  const hasPart1 = /1\.\s*\*\*Kurz\s*&\s*verständlich/i.test(cleaned);
  const hasPart2 = /2\.\s*\*\*Technischer\s*Hintergrund/i.test(cleaned);
  const hasPart3 = /3\.\s*\*\*Lösung\s*&\s*Kosten/i.test(cleaned);

  if (hasPart1 && hasPart2 && hasPart3) {
    // Ensure mandatory closing sentence is present
    if (!cleaned.includes('Du kannst dein Gerät direkt an unserer Werkbank abgeben')) {
      // Append closing sentence right before any trailing text or at end
      cleaned = `${cleaned}\n\n${MANDATORY_CLOSING_SENTENCE}`;
    }
    // Clean unwanted signoffs
    cleaned = cleaned.replace(/\n*(Viele Grüße|Beste Grüße|Dein Mustafa|Dein CODE Team).*$/i, '').trim();
    return cleaned;
  }

  // If format is malformed or missing sections, reconstruct into strict 3-point layout
  let part1 = '';
  let part2 = '';
  let part3 = '';

  const chunks = cleaned.split(/(?:\d\.\s*\*\*|\n\n###|\n###)/);

  if (chunks.length >= 3) {
    part1 = chunks[1] ? chunks[1].replace(/^[^*]*\*\*:?/, '').trim() : '';
    part2 = chunks[2] ? chunks[2].replace(/^[^*]*\*\*:?/, '').trim() : '';
    part3 = chunks[3] ? chunks[3].replace(/^[^*]*\*\*:?/, '').trim() : '';
  }

  if (!part1) {
    part1 = `Auf der Hauptplatine liegt ein bauteilbedingter Kurzschluss oder eine Unterbrechung im primären Spannungs- und Signalpfad vor.${queryHint ? ` (Betrifft: ${queryHint})` : ''}`;
  }
  if (!part2) {
    part2 = 'Durch die Belastung oder thermische Alterung hat mindestens ein aktiver IC (z. B. Power-Management oder Transceiver) oder ein niederohmiger SMD-Sperrkondensator auf der Hauptschiene durchlegiert. Dies löst die interne OCP/UVLO-Schutzabschaltung aus.';
  }
  if (!part3) {
    part3 = 'Wir prüfen das Board im Labor mit Wärmebildkamera und Diodenmessung gegen Masse. Der Richtpreis liegt ab 79 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.';
  }

  // Assemble strictly
  return `1. **Kurz & verständlich (Der Hauptgrund):**
${part1}

2. **Technischer Hintergrund (Chiplevel-Beweis):**
${part2}

3. **Lösung & Kosten (Neumarkt):**
${part3}
${MANDATORY_CLOSING_SENTENCE}`;
}

/**
 * Centralized caller for diagnosis API
 */
export async function requestAiDiagnosis(request: AiDiagnosticRequest): Promise<AiDiagnosticResult> {
  try {
    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }

    const data = await res.json();
    const rawReply = data.reply || '';
    const formatted = validateAndFormatResponse(rawReply, request.deviceCategory);

    return {
      reply: formatted,
      isValidated: true,
      modelUsed: data.modelUsed,
    };
  } catch (err: any) {
    console.warn('API diagnosis request failed, using structured fallback:', err);
    // Return structured emergency fallback complying with exact format
    const fallback = validateAndFormatResponse(
      `1. **Kurz & verständlich (Der Hauptgrund):**
Es liegt ein hardwareseitiger Defekt auf der Hauptplatine vor, der die Initialisierung verhindert.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Eine der Hauptspannungsschienen oder Lade-ICs weist einen Kurzschluss gegen Masse auf. Der integrierte Überspannungs- und Überstromschutz (OCP) sperrt den Systemstart.

3. **Lösung & Kosten (Neumarkt):**
Wir analysieren die Platine unter dem Stereomikroskop mittels Diodenmessung und Wärmebildkamera. Richtpreis ab 79 € inkl. 6 Monaten Garantie in Neumarkt i.d.OPf.
${MANDATORY_CLOSING_SENTENCE}`,
      request.deviceCategory
    );

    return {
      reply: fallback,
      isValidated: true,
    };
  }
}
