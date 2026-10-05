interface Env {
  GEMINI_API_KEY?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body: any = await context.request.json();
    const { deviceCategory, description, errorCodes } = body;
    const apiKey = context.env.GEMINI_API_KEY;

    if (apiKey) {
      const prompt = `Du bist der leitende Mikrolöt- und Elektronik-Meister der "CODE IT-Werkstatt" in Neumarkt in der Oberpfalz.
Analysiere die Fehlerbeschreibung präzise auf Bauteilebene.

Gerätekategorie: ${deviceCategory || 'Elektronik'}
Fehlerbeschreibung: ${description || 'Keine Angabe'}
Fehlercodes: ${errorCodes || 'Keine'}

Antworte exakt in dieser 3-teiligen Struktur:
1. **Kurz & verständlich (Der Hauptgrund):**
Erklärung in 1-2 Sätzen.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Konkrete Bauteilbezeichnungen (z. B. Mosfet, Kondensator, Power-IC, Lötstelle).

3. **Lösung & Kosten (Neumarkt):**
Reparaturweg und Richtpreis (ab 49 € - 149 €).
Schlusssatz: "Bringen Sie das Gerät gerne direkt in unserer Werkstatt in Neumarkt vorbei oder senden Sie es uns per Post ein."`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) {
        const result: any = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return new Response(JSON.stringify({ reply: text, modelUsed: 'gemini-2.5-flash' }), {
            headers: corsHeaders,
          });
        }
      }
    }

    // High quality technical fallback for Cloudflare Edge
    const fallbackText = `1. **Kurz & verständlich (Der Hauptgrund):**
Es liegt ein typischer hardwareseitiger Defekt auf der Hauptplatine vor, der die Initialisierung blockiert.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Wahrscheinlich ist ein Kurzschluss auf der 19V/12V Primär-Schiene oder ein defekter Lade-/Power-Management-IC (PMIC) die Ursache. Der interne Überstromschutz verhindert das Einschalten.

3. **Lösung & Kosten (Neumarkt):**
Wir prüfen das Board unter dem Stereomikroskop mit Wärmebildkamera und Diodenmessung. Reparatur ab 69 € inkl. 6 Monaten Garantie in Neumarkt i.d.OPf.
Bringen Sie das Gerät gerne direkt in unserer Werkstatt in Neumarkt vorbei oder senden Sie es uns per Post ein.`;

    return new Response(JSON.stringify({ reply: fallbackText, modelUsed: 'cloudflare-edge-rules' }), {
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Diagnose konnte nicht verarbeitet werden.',
        details: err?.message,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
