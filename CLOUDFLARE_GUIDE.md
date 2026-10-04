# 🚀 Cloudflare Pages – Bereitstellungs-Leitfaden (CODE IT-Werkstatt)

Dieses Projekt ist zu 100 % für **Cloudflare Pages** und **Cloudflare Workers** optimiert.
Alle nötigen Konfigurationen (`_redirects`, `_headers`, `wrangler.toml`, PWA-Manifest und Serverless-Edge-Funktionen in `functions/`) sind bereits eingerichtet.

---

## ⚡ Option 1: 1-Klick Drag & Drop (Schnellste Methode)

1. Öffne das [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Gehe zu **Workers & Pages** ➔ **Create application** ➔ Reiter **Pages** auswählen.
3. Klicke auf **Upload assets** (Direkter Datei-Upload).
4. Gib als Projektnamen z. B. `code-werkstatt` ein.
5. Lade einfach die fertige Datei **`cloudflare-pages.zip`** hoch (oder entpacke den Ordner **`dist`** und ziehe ihn hinein).
6. Klicke auf **Deploy site** – fertig! Deine Website ist in unter 1 Minute weltweit live auf deiner `.pages.dev`-Domain und kann mit deiner Wunschdomain verknüpft werden.

---

## 🔄 Option 2: Über GitHub / GitLab (Automatisches Deployment)

Wenn das Projekt in einem Git-Repository liegt:

1. Im Cloudflare Dashboard: **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
2. Wähle dein Repository aus.
3. **Build-Einstellungen eintragen:**
   * **Framework preset:** `Vite` (oder `None`)
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
   * **Root directory:** `/` (Standard)
4. *(Optional)* **Umgebungsvariablen:**
   * Falls du deinen eigenen Google Gemini API-Key hinterlegen möchtest:
     * Variable: `GEMINI_API_KEY`
     * Wert: `Dein-Gemini-API-Key`
5. Klicke auf **Save and Deploy**. Jeder Git-Push wird nun automatisch gebaut und aktualisiert.

---

## 💻 Option 3: Über das Terminal (Wrangler CLI)

Führe einfach folgenden Befehl aus:

```bash
# 1. Projekt bauen
npm run build

# 2. Direkt auf Cloudflare Pages veröffentlichen
npx wrangler pages deploy dist --project-name code-werkstatt
```

---

## 🛡️ Was ist für Cloudflare bereits fertig konfiguriert?

1. **`dist/_redirects`:**  
   Sorgt dafür, dass das Single-Page-Application-Routing (SPA) auf Cloudflare Pages für alle Unterseiten und Direktlinks (`/* /index.html 200`) reibungslos funktioniert.

2. **`dist/_headers`:**  
   * Weltweites Edge-Caching (`Cache-Control: public, max-age=31536000, immutable`) für Styles und Skripte in `/assets/`.
   * Strikte Sicherheits-Header (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
   * Automatische Cache-Invalidierung für den Service-Worker (`sw.js`) und das Web-Manifest.

3. **Cloudflare Pages Edge Functions (`functions/api/`):**  
   Serverless APIs laufen direkt am weltweiten Cloudflare-Edge ohne eigenen Server:
   * `/api/diagnose`: KI-Fehlerdiagnose für Elektronik & Platinen
   * `/api/manager/login`: Werkstatt-PIN-Authentifizierung
   * `/api/checkin`: Digitales Ticket-System & DSGVO-Erfassung

4. **Vollständige PWA-Unterstützung:**  
   App-Manifest, Service Worker und Web-Icons für schnelles Laden und Offline-Verfügbarkeit.
