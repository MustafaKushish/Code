/**
 * Standalone HTML export generator for CODE // High-End Platinenreparatur Neumarkt.
 * Produces a single, self-contained HTML file containing styles, SVGs, interactive
 * calculators, board inspector, QR scanner prompt, and embedded Werkstatt-Manager for instant testing in any web browser.
 */

export function downloadStandaloneHtml() {
  const htmlContent = generateStandaloneHtmlString();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CODE-Platinenreparatur-Neumarkt.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateStandaloneHtmlString(): string {
  return `<!doctype html>
<html lang="de" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CODE // High-End Platinenreparatur Neumarkt &amp; Werkstatt-Manager</title>
  <meta name="description" content="Spezial-Werkstatt für Platinenreparatur, Mikrolöten, PS5 HDMI, Hall-Effect Sticks, Laptops & Datenrettung in Neumarkt i.d.OPf. mit integriertem Werkstatt-Manager." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            copper: '#C9743F',
            copperGlow: '#FF8D4D',
            tealGlow: '#00F5D4',
            darkBg: '#060B0C',
            darkSurface: '#0A1214',
            darkCard: '#0D1618',
            mutedText: '#839897'
          },
          fontFamily: {
            mono: ['"IBM Plex Mono"', 'monospace'],
            sans: ['"Space Grotesk"', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #060B0C; color: #F3F7F7; font-family: 'Space Grotesk', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #060B0C; }
    ::-webkit-scrollbar-thumb { background: #172B2E; border-radius: 4px; border: 1px solid rgba(201,116,63,0.3); }
    @keyframes scanSweep { 0% { top: -35%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
    .animate-scan { animation: scanSweep 4s ease-in-out infinite; }
  </style>
</head>
<body class="bg-[#060B0C] text-[#F3F7F7] selection:bg-[#4FA39B]/30 selection:text-[#00F5D4] pb-12">

  <!-- Header HUD with 5-Click Logo Manager Trigger -->
  <header class="sticky top-3.5 z-40 mx-3 sm:mx-6 mb-6">
    <div class="max-w-7xl mx-auto bg-[#0A1214]/90 backdrop-blur-xl border border-[#C9743F]/25 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl">
      <div onclick="handleLogo5Click()" class="flex items-center gap-2.5 cursor-pointer group select-none" title="CODE IT-Werkstatt (5x klicken für Werkstatt-Manager)">
        <svg class="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,141,77,0.5)] transition-transform group-hover:scale-105" viewBox="0 0 500 500">
          <rect width="500" height="500" rx="100" fill="#10191A" />
          <rect x="100" y="100" width="300" height="300" rx="40" fill="#182322" stroke="#C9743F" stroke-width="16" />
          <path d="M 200 60 V 100 M 250 60 V 100 M 300 60 V 100 M 200 400 V 440 M 250 400 V 440 M 300 400 V 440 M 60 200 H 100 M 60 250 H 100 M 60 300 H 100 M 400 200 H 440 M 400 250 H 440 M 400 300 H 440" stroke="#C9743F" stroke-width="16" stroke-linecap="round" />
          <path d="M 190 200 L 140 250 L 190 300 M 310 200 L 360 250 L 310 300" stroke="#4FA39B" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <line x1="270" y1="190" x2="230" y2="310" stroke="#C9743F" stroke-width="24" stroke-linecap="round" />
        </svg>
        <div class="flex flex-col">
          <span class="font-mono text-xl font-extrabold tracking-wider text-white">CODE</span>
          <span class="text-[9px] font-mono text-[#4FA39B] -mt-1 hidden sm:inline">CHIP-LEVEL LAB</span>
        </div>
      </div>
      <nav class="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-[#839897]">
        <a href="#diagnose" class="hover:text-[#00F5D4] transition-colors">Preise &amp; Diagnose</a>
        <a href="#services" class="hover:text-[#00F5D4] transition-colors">Leistungen</a>
        <a href="#status" class="hover:text-[#00F5D4] transition-colors flex items-center gap-1">
          <span>Auftrags-Status</span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#00F5D4]"></span>
        </a>
        <a href="#termin" class="hover:text-[#00F5D4] transition-colors">Termin</a>
        <a href="#b2b" class="hover:text-[#00F5D4] transition-colors">B2B</a>
        <a href="#kontakt" class="hover:text-[#00F5D4] transition-colors">Kontakt</a>
      </nav>
      <div class="flex items-center gap-2">
        <button onclick="toggleManagerModal()" class="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#C9743F]/50 bg-[#C9743F]/15 text-[#FF8D4D] hover:bg-[#C9743F] hover:text-white transition-all cursor-pointer">
          🔧 Manager
        </button>
        <a href="https://wa.me/4917641744443" target="_blank" class="px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#00F5D4] bg-[#00F5D4]/15 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all">
          WhatsApp
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="pt-4 pb-16 md:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div class="lg:col-span-6 space-y-6">
          <div class="inline-flex items-center gap-2 font-mono text-xs text-[#00F5D4] uppercase tracking-widest px-3 py-1.5 bg-[#4FA39B]/15 border-l-3 border-[#00F5D4] rounded-r-md">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping"></span>
            <span>// Spezial-Werkstatt Neumarkt i.d.OPf.</span>
          </div>
          <h1 class="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.12]">
            Präzision bis auf <br />
            <span class="bg-gradient-to-r from-white via-[#FF8D4D] to-[#00F5D4] bg-clip-text text-transparent">
              Bauteilebene.
            </span>
          </h1>
          <div class="bg-[#C9743F]/10 border-l-3 border-[#FF8D4D] px-4 py-2.5 rounded-r-lg">
            <p class="font-mono text-base sm:text-lg text-[#FF8D4D] font-semibold">
              »Reparieren statt Neukaufen, CODE bringt's zum Laufen.«
            </p>
          </div>
          <p class="text-[#839897] text-base leading-relaxed max-w-xl">
            Professionelle Platinenreparaturen für Gaming-Konsolen (PS5 HDMI, Hall-Effect Sticks), Laptops, PCs, Autoschlüssel-Elektronik und Notfall-Datenrettung direkt an der Werkbank in Neumarkt in der Oberpfalz.
          </p>
          <div class="flex flex-wrap gap-3 pt-2">
            <a href="https://wa.me/4917641744443?text=Hallo%20Mustafa%2C%20ich%20habe%20ein%20defektes%20Ger%C3%A4t" target="_blank" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#25D366] text-[#040809] hover:bg-emerald-400 transition-all shadow-lg font-bold">
              WhatsApp Direktanfrage
            </a>
            <a href="#status" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#101D20] border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all">
              🔍 Status &amp; QR-Scan
            </a>
          </div>
        </div>

        <!-- Interactive Board Display -->
        <div class="lg:col-span-6 bg-[#0B1416]/90 border border-[#C9743F]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div class="flex items-center justify-between border-b border-[#C9743F]/20 pb-3 mb-4 text-xs font-mono text-[#00F5D4]">
            <span>&gt; HARDWARE-LABOR NEUMARKT</span>
            <span class="text-[#FF8D4D]">40X STEREOMIKROSKOP</span>
          </div>
          <div class="w-full aspect-16/10 rounded-xl relative overflow-hidden border border-[#C9743F]/40 bg-[#050C0E]">
            <div class="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-[#00F5D4]/20 to-transparent pointer-events-none animate-scan"></div>
            <svg class="w-full h-full block" viewBox="0 0 460 280">
              <rect width="460" height="280" fill="#050C0E" />
              <g fill="none" stroke="#C9743F" stroke-width="1.4" opacity="0.75">
                <path d="M 120 80 H 155 L 180 100 V 110" />
                <path d="M 345 80 H 305 L 280 100 V 110" />
                <path d="M 70 215 H 155 L 180 170 V 160" />
                <path d="M 390 215 H 305 L 280 170 V 160" />
              </g>
              <g transform="translate(180, 90)">
                <rect x="2" y="2" width="96" height="96" rx="8" fill="#0F1B1D" stroke="#C9743F" stroke-width="2" />
                <text x="50" y="50" font-family="'IBM Plex Mono', monospace" font-size="16" font-weight="800" fill="#F3F7F7" text-anchor="middle">CODE</text>
                <text x="50" y="65" font-family="'IBM Plex Mono', monospace" font-size="8" fill="#00F5D4" text-anchor="middle">LAB // CHIP-LEVEL</text>
              </g>
            </svg>
          </div>
          <div class="mt-4 bg-[#050B0D] border border-[#4FA39B]/30 rounded-xl p-3.5 font-mono text-xs text-[#00F5D4]">
            &gt; PS5 HDMI 2.1 &amp; Retimer IC • 19 Pins geprüft • ESD-Dioden intakt • 4K/120Hz Signal stabil
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Live Repair Status Tracker with Input & QR Camera Scanner Trigger -->
  <section id="status" class="py-16 md:py-20 relative bg-[#070D0E]/60 border-t border-b border-[#00F5D4]/25">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-xl mx-auto mb-8">
        <span class="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-1">
          // Auftrags-Status &amp; Live-Schnittstelle
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Reparaturstatus abfragen
        </h2>
        <p class="text-[#839897] text-xs sm:text-sm leading-relaxed">
          Tippe deine Auftragsnummer ein oder scanne mit der Kamera den QR-Code deines Begleitscheins.
        </p>
      </div>

      <div class="bg-[#0A1214] border border-[#00F5D4]/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div class="flex flex-col sm:flex-row gap-2.5 mb-6">
          <input
            id="ticketInputElem"
            type="text"
            placeholder="Auftragsnummer (z. B. CODE-9231, RE-2026-001)"
            value="CODE-9231"
            class="flex-1 bg-[#05090A] border border-[#C9743F]/40 focus:border-[#00F5D4] rounded-xl px-4 py-3 text-sm text-white font-mono uppercase outline-none"
          />
          <button
            type="button"
            onclick="promptCameraScan()"
            class="px-4 py-3 rounded-xl bg-[#122225] border border-[#00F5D4]/60 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black font-mono font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            📷 QR Scannen
          </button>
          <button
            type="button"
            onclick="performTicketSearch()"
            class="px-5 py-3 rounded-xl bg-[#00F5D4] text-[#060B0C] font-mono font-bold text-xs uppercase hover:bg-white transition-all cursor-pointer shadow-lg shadow-[#00F5D4]/20"
          >
            Prüfen
          </button>
        </div>

        <div id="ticketResultBox" class="bg-[#050A0B] border border-white/10 rounded-2xl p-6 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span class="font-mono text-xs text-[#839897] uppercase">Auftrags-Nr.</span>
              <div id="resTicketId" class="font-mono text-2xl font-extrabold text-[#00F5D4]">CODE-9231</div>
            </div>
            <div>
              <span class="font-mono text-xs text-[#839897] uppercase">Gerät</span>
              <div id="resDevice" class="text-sm sm:text-base font-bold text-white">PlayStation 5 (Disc Edition)</div>
            </div>
            <div class="text-right">
              <span class="font-mono text-xs text-[#839897] uppercase">Fertigstellung</span>
              <div id="resCompletion" class="font-mono text-sm sm:text-base font-bold text-[#FF8D4D]">Heute, 17:00 Uhr</div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs text-center">
            <div class="p-2.5 rounded-lg bg-white/5 border border-[#00F5D4]/40 text-white">✓ 1. Eingang</div>
            <div class="p-2.5 rounded-lg bg-white/5 border border-[#00F5D4]/40 text-white">✓ 2. Mikroskop</div>
            <div class="p-2.5 rounded-lg bg-white/5 border border-[#00F5D4]/40 text-white">✓ 3. Mikrolöten</div>
            <div class="p-2.5 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] font-bold shadow-md shadow-[#00F5D4]/20">4. 4K Stresstest</div>
            <div class="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[#839897]">5. Abholbereit</div>
          </div>

          <div class="bg-[#0C1719] border border-[#00F5D4]/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div class="font-mono text-[#00F5D4] font-bold uppercase mb-1">&gt; AKTUELLER LABOR-STATUS:</div>
              <p id="resStatusDetails" class="text-[#F3F7F7]">
                OEM-HDMI-Port erfolgreich eingelötet (Silberlot). 4K/120Hz Signal stabil. Letzter 30-Minuten Lasttest läuft.
              </p>
            </div>
            <a href="https://wa.me/4917641744443" target="_blank" class="shrink-0 px-4 py-2 rounded-lg bg-[#25D366] text-black font-bold font-mono">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Diagnose & Cost Calculator -->
  <section id="diagnose" class="py-16 md:py-20 relative">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="font-mono text-xs text-[#00F5D4] uppercase tracking-widest block mb-2">// Transparente Werkstatt-Preise</span>
        <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">Diagnose &amp; Preisschätzung</h2>
        <p class="text-[#839897] text-sm">Festpreise inklusive 19% MwSt. und 6 Monaten Garantie.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-[#0A1214] border border-[#C9743F]/30 rounded-2xl p-5 hover:border-[#00F5D4] transition-all">
          <div class="text-2xl mb-2">🎮</div>
          <h3 class="font-bold text-white mb-1">PS5 / Xbox HDMI-Port</h3>
          <p class="text-xs text-[#839897] mb-3">Kein Bild am Fernseher, Buchse wackelt oder Pins verbogen.</p>
          <div class="text-xl font-bold text-[#FF8D4D] font-mono">ab 90,00 €</div>
          <span class="text-[11px] font-mono text-[#00F5D4] block mt-1">Dauer: 1–2 Werktage</span>
        </div>
        <div class="bg-[#0A1214] border border-[#C9743F]/30 rounded-2xl p-5 hover:border-[#00F5D4] transition-all">
          <div class="text-2xl mb-2">🕹️</div>
          <h3 class="font-bold text-white mb-1">Hall-Effect Sticks Upgrade</h3>
          <p class="text-xs text-[#839897] mb-3">Verschleißfreie elektromagnetische Sensoren gegen Stick-Drift.</p>
          <div class="text-xl font-bold text-[#FF8D4D] font-mono">ab 40,00 € (Dual: 70 €)</div>
          <span class="text-[11px] font-mono text-[#00F5D4] block mt-1">Dauer: Meist am selben Tag</span>
        </div>
        <div class="bg-[#0A1214] border border-[#C9743F]/30 rounded-2xl p-5 hover:border-[#00F5D4] transition-all">
          <div class="text-2xl mb-2">💻</div>
          <h3 class="font-bold text-white mb-1">Laptop &amp; MacBook Platinen</h3>
          <p class="text-xs text-[#839897] mb-3">Kurzschluss, Wasserschaden oder USB-C Power-Delivery Defekt.</p>
          <div class="text-xl font-bold text-[#FF8D4D] font-mono">ab 89,00 €</div>
          <span class="text-[11px] font-mono text-[#00F5D4] block mt-1">Dauer: 2–4 Werktage</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact & Location -->
  <section id="kontakt" class="py-16 md:py-20">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="bg-[#0A1214] border border-[#C9743F]/30 rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <span class="font-mono text-xs text-[#00F5D4] uppercase tracking-wider block">// Inhabergeführt in Neumarkt i.d.OPf.</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Mustafa Al-Zurgany — CODE IT-Werkstatt</h2>
        <p class="text-sm text-[#839897] max-w-lg mx-auto leading-relaxed">
          Termine nach kurzer telefonischer Absprache an der Werkbank in 92318 Neumarkt i.d.OPf.
        </p>
        <div class="flex flex-wrap justify-center gap-6 font-mono text-sm pt-4">
          <a href="tel:017641744443" class="text-white hover:text-[#00F5D4] transition-colors">📞 0176 4174 4443</a>
          <a href="mailto:mustafa.alzurgany@gmail.com" class="text-white hover:text-[#00F5D4] transition-colors">✉️ mustafa.alzurgany@gmail.com</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer with 5-Click Trigger -->
  <footer class="border-t border-[#C9743F]/25 bg-[#040708] py-8 text-xs text-[#839897] font-mono text-center">
    <div onclick="handleLogo5Click()" class="cursor-pointer select-none inline-block hover:text-[#00F5D4] transition">
      <p>© 2026 CODE // Inhaber Mustafa Al-Zurgany • 92318 Neumarkt in der Oberpfalz</p>
    </div>
    <p class="text-[#FF8D4D] mt-1">»Reparieren statt Neukaufen, CODE bringt's zum Laufen.«</p>
  </footer>

  <!-- Embedded Werkstatt Manager Modal View -->
  <div id="managerModal" class="fixed inset-0 z-50 bg-[#060B0C] p-4 sm:p-6 overflow-y-auto hidden">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-3">
          <button onclick="toggleManagerModal()" class="px-3.5 py-2 rounded-xl bg-[#122225] border border-[#00F5D4] text-[#00F5D4] font-mono text-xs font-bold hover:bg-[#00F5D4] hover:text-black transition">
            ← Zurück zur Kundenansicht
          </button>
          <span class="font-mono font-bold text-white text-base">CODE // WERKSTATT MANAGER</span>
        </div>
      </div>

      <div class="bg-[#0B1416] border border-[#C9743F]/40 rounded-2xl p-6 text-center space-y-4">
        <h3 class="font-mono text-xl font-bold text-white">Werkstatt Manager App-in-App</h3>
        <p class="text-sm text-[#839897] max-w-xl mx-auto font-mono">
          In der Web-App (Port 3000 / Entwicklungs-Server) ist der vollständige CODE WWS Manager mit Kalkulator, Auftragsbuch, Barcode-Labels, Kundenunterschriften und Inventar direkt über 5x Klicken auf das Logo oder die Tastenkombination <kbd class="px-1.5 py-0.5 rounded bg-black border border-white/20 text-[#00F5D4]">Ctrl + Shift + L</kbd> freigeschaltet!
        </p>
        <button onclick="toggleManagerModal()" class="px-6 py-2.5 rounded-xl bg-[#00F5D4] text-black font-mono font-bold text-xs uppercase hover:bg-white transition shadow-lg">
          Fenster schließen
        </button>
      </div>
    </div>
  </div>

  <script>
    let logoClicks = 0;
    let logoTimer = null;

    function handleLogo5Click() {
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 1500);
      if (logoClicks >= 5) {
        logoClicks = 0;
        toggleManagerModal();
      }
    }

    function toggleManagerModal() {
      const modal = document.getElementById('managerModal');
      if (modal) {
        modal.classList.toggle('hidden');
      }
    }

    function promptCameraScan() {
      const scanned = prompt("Auftrags-QR-Code scannen oder Code eingeben (z. B. CODE-9231 oder RE-2026-001):", "CODE-9231");
      if (scanned) {
        document.getElementById('ticketInputElem').value = scanned.trim().toUpperCase();
        performTicketSearch();
      }
    }

    function performTicketSearch() {
      const val = document.getElementById('ticketInputElem').value.trim().toUpperCase();
      if (!val) return;
      document.getElementById('resTicketId').innerText = val;
      if (val.includes('4412')) {
        document.getElementById('resDevice').innerText = 'Lenovo ThinkPad T14 Gen 2';
        document.getElementById('resCompletion').innerText = 'Morgen Vormittag';
        document.getElementById('resStatusDetails').innerText = 'Kurzschluss auf 19V VDD_MAIN durch defekten SMD-Kondensator behoben.';
      } else {
        document.getElementById('resDevice').innerText = 'PlayStation 5 (Disc Edition)';
        document.getElementById('resCompletion').innerText = 'Heute, 17:00 Uhr';
        document.getElementById('resStatusDetails').innerText = 'OEM-HDMI-Port erfolgreich eingelötet (Silberlot). 4K/120Hz Signal stabil.';
      }
    }

    // Keyboard shortcut Ctrl+Shift+L
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') || (e.altKey && e.key.toLowerCase() === 'w')) {
        e.preventDefault();
        toggleManagerModal();
      }
    });
  </script>
</body>
</html>`;
}
