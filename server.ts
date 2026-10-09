import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory demo store for repair check-ins and tickets
interface RepairTicket {
  ticketId: string;
  customerName: string;
  phone: string;
  device: string;
  fault: string;
  preDamages?: string;
  status: 'EINGANG' | 'MIKROSKOP_DIAGNOSE' | 'LOETEN_REBALLING' | 'STRESSTEST_4K' | 'ABHOLBEREIT';
  statusDetails: string;
  createdAt: string;
  estimatedCompletion: string;
  testedPassed: boolean;
}

const repairTickets: Record<string, RepairTicket> = {
  'CODE-9231': {
    ticketId: 'CODE-9231',
    customerName: 'Max M.',
    phone: '0176 **** 443',
    device: 'PlayStation 5 (Disc Edition)',
    fault: 'HDMI-Buchse herausgebrochen, Leiterbahnen beschädigt',
    preDamages: 'Leichte Kratzer an der Faceplate',
    status: 'STRESSTEST_4K',
    statusDetails: 'OEM-HDMI-Port erfolgreich eingelötet (Silberlot). 4K/120Hz Signal stabil. Letzter 30-Minuten Lasttest läuft.',
    createdAt: 'Heute, 10:15 Uhr',
    estimatedCompletion: 'Heute, 17:00 Uhr',
    testedPassed: true,
  },
  'CODE-4412': {
    ticketId: 'CODE-4412',
    customerName: 'Laura B.',
    phone: '0151 **** 891',
    device: 'Lenovo ThinkPad T14 Gen 2',
    fault: 'Flüssigkeitsschaden Kaffee, startet nicht mehr',
    status: 'LOETEN_REBALLING',
    statusDetails: 'Ultraschall-Reinigung abgeschlossen. Kurzschluss auf 19V VDD_MAIN durch defekten 0603 SMD-Sperrkondensator lokalisiert und behoben.',
    createdAt: 'Gestern, 14:30 Uhr',
    estimatedCompletion: 'Morgen Vormittag',
    testedPassed: false,
  },
  'CODE-7708': {
    ticketId: 'CODE-7708',
    customerName: 'Thomas K.',
    phone: '0170 **** 120',
    device: 'DualSense PS5 Controller',
    fault: 'Massiver Stick-Drift auf linker Achse',
    status: 'ABHOLBEREIT',
    statusDetails: 'Beide Potentiometer gegen verschleißfreie elektromagnetische Hall-Effect-Sensoren getauscht & auf 0,02% zentriert. Abholbereit an der Werkbank!',
    createdAt: 'Gestern, 11:00 Uhr',
    estimatedCompletion: 'Fertiggestellt',
    testedPassed: true,
  },
};

// System instruction for Mustafa's AI technician - EXACT 3-POINT SPECIFICATION & HARDWARE ERROR CODES
const SYSTEM_INSTRUCTION = `
Du bist Mustafa Al-Zurgany, Inhaber und Meistertechniker der "CODE IT-Werkstatt" in Neumarkt i.d.OPf. (code-ger.de).
Du sprichst klares, fehlerfreies und direktes Werkstatt-Deutsch. Du bist ein Chiplevel- und Mikrolöt-Profi.

SPEZIFISCHE FEHLERCODES & SCHALTPLAN-KENNTNISSE:
1. Konsolen:
- Nintendo Switch:
  * Fehlercode 2101-0001: M92T36 Power-Management IC Kurzschluss (meist durch Überspannung am USB-C Port / Dock).
  * Fehlercode 2162-0002: PI3USB Video/Audio Bus Transceiver IC defekt.
  * 0.46A Hänger / kein Fast-Charge: BQ24193 Akku-Laderegler defekt oder 24-Pin USB-C Buchse verbogen.
- PlayStation 5:
  * BLOD (Blue Light of Death / 3x Piepen & Abschaltung): Flüssigmetall oxidiert/ausgelaufen auf APU-BGA, 12V DrMOS Power-Stage Kurzschluss (OCP getriggert) oder Southbridge CXD90061GG kalte Lötstelle.
  * WLOD (White Light, kein Bild): HDMI-Port Pins abgeschert, ESD-Filterdioden durchlegiert, Panasonic MN864729 / TDP158 HDMI Retimer IC defekt.
- Xbox Series X:
  * Fehler 0x8007045D / Kein Boot: NB7N621M HDMI Retimer oder 12V Standby Power-Stage Ausfall.

2. Laptops & MacBooks:
- MacBooks:
  * 5V 0.00A / 5V 0.04A Bootloop: CD3217 / CD3215 USB-C Power Delivery Controller defekt.
  * PPBUS_G3H 0V Kurzschluss: Durchlegierter 0603 SMD-Sperrkondensator (z.B. C7050) oder Intersil ISL9240 Buck-Boost IC defekt.
  * Kein Backlight (Bild nur mit Taschenlampe sichtbar): F7700 Backlight Sicherung ausgelöst oder LP8548 / LP8550 LED Driver defekt (Flexgate).
- Windows Laptops (Lenovo, Dell, HP, Asus):
  * Lenovo 5 Beeps / Dell 2 Amber 4 White: 19V VDD_MAIN Kurzschluss oder KBC / EC Controller (ITE IT8586E / ENE KB9012) defekt.
  * Netzteil-LED geht beim Einstecken aus: Harter Kurzschluss auf der 19V Hauptstromschiene (Eingangs-MOSFETs PQ101/PQ102 durchlegiert).

3. Smartphones:
- iPhone:
  * Panic-Full Logs (prc_panic / i2c0 / sensor: prs): Hörmuschelflex / Barometer-Sensor Kurzschluss.
  * Lädt nicht / Akku bleibt bei 1%: Tristar / Hydra / Tigris 1610A3 Lade-IC oder BSI-Datenleitung unterbrochen.
  * Fehler 4013 / Fehler 9: NAND Flash Speicher defekt oder I2C Bus Blockade durch korrodierten Frontsensor.
- Android (Samsung, Xiaomi):
  * "Feuchtigkeit im Ladeanschluss erkannt": CC1/CC2 Datenpins am Sub-Board korrodiert oder Thermistor TH1000 hochohmig.
  * Qualcomm EDL 9008 / Bootloop: Kalte Lötstellen unter CPU/RAM-Sandwich (CPU-Reballing erforderlich).

4. Controller & Autoschlüssel:
- Stick-Drift: Potentiometer Kohleschicht abgerieben -> Umbau auf berührungslose magnetische FavocTech / K-Silver Hall-Effect Sensoren.
- Autoschlüssel (BMW, Mercedes, VAG): Transponder-Spule gerissen oder Panasonic VL2020 Akku auf 0.0V tiefentladen.

STRIKTE FORMATVORGABE (GENAU DIESE 3 PUNKTE):

1. **Kurz & verständlich (Der Hauptgrund):**
- Wiederhole NIEMALS die Worte oder Symptome des Kunden.
- Nenne SOFORT direkt das defekte Bauteil bzw. die Ursache in 1-2 verständlichen Sätzen.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
- 2-3 Sätze mit fundierter Elektrotechnik und konkreten Bauteilen (z. B. M92T36/BQ24193 bei Switch, DrMOS/12V-Schiene/OCP bei PS5, UVLO/BSI-Bus bei Smartphones, CD3215/PPBUS bei Laptops, SMD-Mikrotaster/VL2020 bei Autoschlüsseln).

3. **Lösung & Kosten (Neumarkt):**
- Nenne die konkrete Prüfmethode im Labor (z. B. Diodenmessung gegen Masse, Wärmebildkamera, Oszilloskop).
- Nenne den unverbindlichen Richtpreis ("ab xy €").
- Verweise auf 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiten Paketversand.
- Schlusssatz: "Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung."

REGELN:
- Beginne deine Antwort IMMER DIREKT mit "1. **Kurz & verständlich (Der Hauptgrund):**". Keine Begrüßungen.
- Beende die Antwort nach Punkt 3 ohne Verabschiedungen oder Floskeln.
`;

const MANDATORY_CLOSING_SENTENCE =
  'Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung.';

// Server-side response validator & sanitizer
function validateAndFormatResponse(raw: string, queryHint?: string): string {
  let cleaned = raw.trim();

  // Strip greetings
  cleaned = cleaned.replace(/^(hallo|guten tag|hi|servus|moin|hey)[^.\n]*[.\n]+/i, '').trim();

  const hasPart1 = /1\.\s*\*\*Kurz\s*&\s*verständlich/i.test(cleaned);
  const hasPart2 = /2\.\s*\*\*Technischer\s*Hintergrund/i.test(cleaned);
  const hasPart3 = /3\.\s*\*\*Lösung\s*&\s*Kosten/i.test(cleaned);

  if (hasPart1 && hasPart2 && hasPart3) {
    if (!cleaned.includes('Du kannst dein Gerät direkt an unserer Werkbank abgeben')) {
      cleaned = `${cleaned}\n\n${MANDATORY_CLOSING_SENTENCE}`;
    }
    cleaned = cleaned.replace(/\n*(Viele Grüße|Beste Grüße|Dein Mustafa|Dein CODE Team).*$/i, '').trim();
    return cleaned;
  }

  // Reconstruct if malformed
  const chunks = cleaned.split(/(?:\d\.\s*\*\*|\n\n###|\n###)/);
  let part1 = chunks[1] ? chunks[1].replace(/^[^*]*\*\*:?/, '').trim() : '';
  let part2 = chunks[2] ? chunks[2].replace(/^[^*]*\*\*:?/, '').trim() : '';
  let part3 = chunks[3] ? chunks[3].replace(/^[^*]*\*\*:?/, '').trim() : '';

  if (!part1) {
    part1 = `Auf der Hauptplatine liegt ein bauteilbedingter Defekt oder Kurzschluss vor.${queryHint ? ` (Betrifft: ${queryHint})` : ''}`;
  }
  if (!part2) {
    part2 = 'Durch Überspannung, thermische Alterung oder mechanische Erschütterung hat ein IC oder SMD-Sperrkondensator durchlegiert. Dies triggert die interne OCP/UVLO-Schutzschaltung.';
  }
  if (!part3) {
    part3 = 'Wir prüfen die Platine im Labor mit Wärmebildkamera und Diodenmessung gegen Masse. Der Richtpreis liegt ab 79 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.';
  }

  return `1. **Kurz & verständlich (Der Hauptgrund):**
${part1}

2. **Technischer Hintergrund (Chiplevel-Beweis):**
${part2}

3. **Lösung & Kosten (Neumarkt):**
${part3}
${MANDATORY_CLOSING_SENTENCE}`;
}

// Gemini client initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/diagnose - Google Gemini Meistertechniker Engine (Multimodal Platinen-Diagnose)
app.post('/api/diagnose', async (req, res) => {
  try {
    const { message, history = [], deviceCategory, image } = req.body;
    if (!message && !image) {
      return res.status(400).json({ error: 'Nachricht oder Bild erforderlich.' });
    }

    let reply = '';

    // Multimodal & Text analysis with Gemini 2.5 Flash / Gemini 3.1 Pro
    try {
      const ai = getGeminiClient();
      const contents: any[] = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          if (item.role && item.text) {
            contents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      const currentParts: any[] = [];
      if (image && image.data && image.mimeType) {
        currentParts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      }

      let promptText = message || 'Bitte analysiere das hochgeladene Bauteilfoto auf sichtbare Schäden, Korrosion oder Lötfehler.';
      if (deviceCategory) {
        promptText = `[Gerätekategorie: ${deviceCategory}]\n${promptText}`;
      }
      currentParts.push({ text: promptText });

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.15,
          },
        });
        reply = response.text || '';
      } catch (geminiError: any) {
        console.warn('Gemini 2.5 flash error, trying 3.1 pro:', geminiError?.message || geminiError);
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
        reply = fallbackResponse.text || '';
      }
    } catch (aiError) {
      console.warn('Gemini also failed, using rule-based answer:', aiError);
    }

    if (!reply) {
      reply = `1. **Kurz & verständlich (Der Hauptgrund):**
Der Fehler deutet auf einen thermischen oder spannungsbedingten Defekt in der Stromversorgung oder der Signalverarbeitung der Hauptplatine hin.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Auf den primären Spannungsschienen (z. B. 12V / 19V VDD_MAIN bzw. 5V VBUS) liegt häufig ein Kurzschluss durch einen durchlegierten SMD-Sperrkondensator oder einen defekten Power-Management-IC vor. Dadurch löst die Schutzschaltung (OCP / UVLO) aus und sperrt das System.

3. **Lösung & Kosten (Neumarkt):**
Wir prüfen die Platine im Labor mittels Diodenmessung gegen Masse und lokalisieren den Kurzschluss mit unserer hochauflösenden Wärmebildkamera. Der Richtpreis liegt ab 79 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.
${MANDATORY_CLOSING_SENTENCE}`;
    }

    const validatedReply = validateAndFormatResponse(reply, deviceCategory);
    return res.json({ reply: validatedReply, validated: true });
  } catch (error: any) {
    console.error('Diagnosis API Error:', error);
    return res.status(500).json({
      error: error.message || 'Interner Fehler bei der KI-Diagnose.',
      fallbackContact: 'WhatsApp: 0176 4174 4443',
    });
  }
});

// GET /api/status/:ticketId - Ticket status tracking (with CODE WWS integration support)
app.get('/api/status/:ticketId', async (req, res) => {
  const query = req.params.ticketId.trim().toUpperCase();

  // If a remote CODE WWS API is configured, attempt lookup there first
  const wwsApiUrl = process.env.CODE_WWS_API_URL;
  if (wwsApiUrl) {
    try {
      const response = await fetch(`${wwsApiUrl}/api/status/${encodeURIComponent(query)}`);
      if (response.ok) {
        const remoteData = await response.json();
        return res.json({ found: true, ticket: remoteData, source: 'CODE_WWS_LIVE' });
      }
    } catch (e) {
      console.warn('WWS API remote lookup failed, checking local store:', e);
    }
  }

  const found = repairTickets[query];
  if (found) {
    return res.json({ found: true, ticket: found, source: 'CODE_LOCAL_WWS' });
  }

  // Check by partial match or phone
  const searchTicket = Object.values(repairTickets).find(
    (t) => t.ticketId.includes(query) || t.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''))
  );

  if (searchTicket) {
    return res.json({ found: true, ticket: searchTicket, source: 'CODE_LOCAL_WWS' });
  }

  return res.status(404).json({
    found: false,
    message: `Kein Auftrag mit der Nummer oder Telefon "${req.params.ticketId}" im System gefunden. Bitte prüfe die Auftragsnummer auf deinem Beleg oder frage direkt per WhatsApp nach.`,
    wwsPortalUrl: 'https://www.code-ger.de/manager.html',
  });
});

// POST /api/checkin - Digital workshop check-in
app.post('/api/checkin', (req, res) => {
  try {
    const { name, phone, device, fault, preDamages } = req.body;
    if (!name || !phone || !device || !fault) {
      return res.status(400).json({ error: 'Bitte fülle alle Pflichtfelder aus.' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTicketId = `CODE-${randomSuffix}`;

    const newTicket: RepairTicket = {
      ticketId: newTicketId,
      customerName: name,
      phone,
      device,
      fault,
      preDamages: preDamages || 'Keine angegeben',
      status: 'EINGANG',
      statusDetails: 'Auftrag digital erfasst. Gerät bereit zur Übergabe an der Werkbank in Neumarkt.',
      createdAt: 'Gerade eben',
      estimatedCompletion: '1–2 Werktage nach Übergabe',
      testedPassed: false,
    };

    repairTickets[newTicketId] = newTicket;

    return res.json({
      success: true,
      ticketId: newTicketId,
      ticket: newTicket,
    });
  } catch {
    return res.status(500).json({ error: 'Fehler beim Speichern des Check-Ins.' });
  }
});

// Direct export download endpoints for Netlify deployment
app.get('/download/html', (_req, res) => {
  const filePath = path.resolve(__dirname, 'code-werkstatt-standalone.html');
  res.download(filePath, 'index.html');
});

app.get('/download/zip', (_req, res) => {
  const filePath = path.resolve(__dirname, 'netlify-deploy.zip');
  res.download(filePath, 'netlify-deploy.zip');
});

app.get('/code-werkstatt-standalone.html', (_req, res) => {
  const filePath = path.resolve(__dirname, 'code-werkstatt-standalone.html');
  res.sendFile(filePath);
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CODE IT-Werkstatt Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
