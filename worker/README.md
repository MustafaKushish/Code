# Auftrags-API (Cloudflare Worker) – Umstellung

Dieser Worker ersetzt den bisherigen `code-techniker`-Worker. Er nutzt **dieselbe D1-Datenbank**.
Es gehen also keine Aufträge verloren.

## Was sich ändert

| Vorher | Nachher |
|---|---|
| Jeder konnte alle Aufträge lesen, ändern, löschen | Nur mit geheimem **Werkstatt-Schlüssel** (`ADMIN_KEY`) |
| Status-Abfrage lud **alle** Kundendaten in den Browser | Kunde bekommt nur **seinen** Auftrag (Auftragsnr. + letzte 4 Telefonziffern), ohne Adresse, Telefon oder Preise |
| Manager-Zugang mit PIN „2026“ im Website-Code | Schlüssel wird nur vom Worker geprüft, steht nirgends im Code |
| Beliebig viele Rateversuche | Sperre für 15 Minuten nach 10 falschen Status-Abfragen bzw. 5 falschen Schlüsseln (pro IP) |

## Umstellung (ca. 15 Minuten)

> **Reihenfolge ist wichtig:** zuerst der Worker, dann die Website.
> Wenn nur die Website umgestellt ist, funktionieren Manager und Status-Abfrage nicht.

### 1. Werkstatt-Schlüssel ausdenken

Mindestens 12 Zeichen, besser ein Satz, z. B. `Lötkolben-Neumarkt-Kaffee-47`.
Diesen Schlüssel **nirgends in den Code schreiben**, nur im Passwort-Manager aufheben.

### 2. Groq-Schlüssel sperren (wichtig!)

Der alte Worker enthielt einen Groq-API-Schlüssel im Klartext (`gsk_…`). Derselbe Schlüssel steht auch in der
Git-Historie dieses Repos. Unter **console.groq.com → API Keys** den Schlüssel löschen.
Der neue Worker braucht Groq nicht mehr – der KI-Techniker der Website läuft über Google Gemini (Cloudflare Pages).
Die Tabelle `customer_queries` mit den alten KI-Anfragen bleibt unverändert in der Datenbank.

### 3. Neue Tabelle für die Sperre anlegen

Cloudflare-Dashboard → **Workers & Pages → D1** → Datenbank des Workers → **Console**, dann ausführen
(ändert an den Aufträgen nichts):
```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
```

### 4. Worker veröffentlichen (geht auch am Handy)

1. **Workers & Pages → code-techniker → Edit code**. Den alten Code komplett kopieren und sicher aufheben (Notfall).
2. Den gesamten Inhalt von [`worker/code-techniker.js`](code-techniker.js) einfügen (alten Code ersetzen) → **Deploy**.
3. **code-techniker → Settings → Variables and Secrets → Add**: Typ **Secret**, Name `ADMIN_KEY`, Wert = Schlüssel aus Schritt 1.
4. Prüfen, dass unter **Settings → Bindings** die D1-Datenbank weiterhin als `DB` verbunden ist (wie bisher).

Erlaubte Website-Adressen sind fest eingebaut: `https://www.code-ger.de` und `https://code-ger.de`.
Für weitere Adressen eine Variable `ALLOWED_ORIGINS` (kommagetrennt) anlegen.

Alternativ per Kommandozeile: `database_name`/`database_id` in `worker/wrangler.toml` eintragen, dann
`cd worker && npx wrangler secret put ADMIN_KEY && npx wrangler deploy`.

### 5. Kurz testen

Im Browser öffnen: `https://code-techniker.mustafa-alzurgany.workers.dev/api/orders`
→ Es muss **„Werkstatt-Schlüssel ungültig.“** erscheinen – **keine** Kundenliste mehr.

### 6. Website umstellen

Auf GitHub erst `security/worker-auth`, dann `design/refresh` nach `main` mergen.
Cloudflare Pages baut und veröffentlicht die Seite automatisch.

### 7. Manager entsperren

Auf jedem Werkstatt-Gerät einmal den Manager öffnen (Alt+W oder 5× aufs Logo) und den Schlüssel eingeben.
Er bleibt auf dem Gerät gespeichert. Wird der Schlüssel später geändert (`wrangler secret put ADMIN_KEY`),
fragt der Manager automatisch neu.

**Danach im Manager unter Einstellungen die Admin-PIN ändern**, falls sie noch auf dem Standardwert steht.
Diese PIN regelt nur, welcher Mitarbeiter am Gerät angemeldet ist. Den eigentlichen Schutz übernimmt der Schlüssel.

## Für Kunden

Auf dem Abholschein bzw. per WhatsApp: *„Status online abfragen: www.code-ger.de → Reparaturstatus →
Auftragsnummer + die letzten 4 Ziffern Ihrer Telefonnummer.“*
Direkt-Link möglich: `https://www.code-ger.de/?order=RE-2026-12345&k=4443`

## Rückweg im Notfall

Im Dashboard den gesicherten alten Worker-Code wieder einfügen und speichern.
Website: den Merge in GitHub rückgängig machen (Revert).
