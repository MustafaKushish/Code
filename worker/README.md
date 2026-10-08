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

### 2. Datenbank nachschlagen

Cloudflare-Dashboard → **Workers & Pages → D1** → die Datenbank des Workers öffnen.
- Namen und ID in `worker/wrangler.toml` bei `database_name` / `database_id` eintragen.
- Unter **Console** prüfen, wie die Tabelle heißt und welche Spalten sie hat:
  ```sql
  SELECT name, sql FROM sqlite_master WHERE type = 'table';
  ```
  Der Worker erwartet die Tabelle `orders` mit den Spalten aus `schema.sql`.
  Falls Name oder Spalten abweichen → kurz melden, dann passen wir den Code an.

### 3. Neue Tabelle für die Sperre anlegen

In der D1-**Console** ausführen (ändert an den Aufträgen nichts):
```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
```

### 4. Worker veröffentlichen

Vorher den aktuellen Worker-Code im Dashboard sichern (Code bearbeiten → alles kopieren).

```bash
cd worker
npx wrangler login
npx wrangler secret put ADMIN_KEY     # Schlüssel aus Schritt 1 eingeben
npx wrangler deploy
```

### 5. Kurz testen

```bash
# Muss 401 liefern (ohne Schlüssel kein Zugriff):
curl -i https://code-techniker.mustafa-alzurgany.workers.dev/api/orders

# Muss {"success":true} liefern:
curl -H "Authorization: Bearer DEIN-SCHLÜSSEL" https://code-techniker.mustafa-alzurgany.workers.dev/api/auth
```

### 6. Website umstellen

Branch `security/worker-auth` nach `main` mergen. Cloudflare Pages baut die Seite automatisch neu.

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
