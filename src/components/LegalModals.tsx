import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

// Datenschutzhinweise – beschreiben genau die Datenflüsse dieser Website.
// Bei neuen Diensten (z. B. Analyse-Tools, Karten, Videos) hier ergänzen.
const PRIVACY_SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Verantwortlicher',
    body: [
      'CODE IT-Werkstatt, Inhaber Mustafa Al-Zurgany, 92318 Neumarkt in der Oberpfalz, Telefon +49 176 4174 4443, E-Mail mustafa.alzurgany@gmail.com.',
    ],
  },
  {
    title: 'Hosting und Server-Logfiles (Cloudflare)',
    body: [
      'Diese Website und unsere Schnittstellen werden über Cloudflare, Inc. (101 Townsend St, San Francisco, CA 94107, USA) ausgeliefert. Beim Aufruf werden technisch notwendige Verbindungsdaten verarbeitet (IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser-Kennung), um die Seite sicher und stabil bereitzustellen.',
      'Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert.',
    ],
  },
  {
    title: 'Keine Cookies, kein Tracking',
    body: [
      'Wir setzen keine Cookies und keine Analyse- oder Werbedienste ein. Schriftarten werden von unserem eigenen Server geladen – es besteht keine Verbindung zu Google Fonts.',
      'Damit die Seite schneller lädt und offline teilweise verfügbar ist, speichert dein Browser Programmdateien der Seite (Service Worker). Darin sind keine personenbezogenen Daten enthalten.',
    ],
  },
  {
    title: 'Kontakt per Telefon, E-Mail und WhatsApp',
    body: [
      'Wenn du uns anrufst, schreibst oder den digitalen Check-in nutzt, verarbeiten wir deine Angaben (z. B. Name, Telefonnummer, Gerät, Fehlerbeschreibung) zur Bearbeitung deiner Anfrage und zur Durchführung des Reparaturauftrags (Art. 6 Abs. 1 lit. b DSGVO).',
      'Der Check-in wird nicht auf unserer Website gespeichert, sondern als vorbereitete Nachricht in WhatsApp bzw. deinem E-Mail-Programm geöffnet. Bei WhatsApp verarbeitet zusätzlich WhatsApp Ireland Ltd. (Meta) deine Nachricht nach eigenen Datenschutzbestimmungen.',
    ],
  },
  {
    title: 'Terminbuchung (Cal.com)',
    body: [
      'Für Online-Termine nutzen wir Cal.com, Inc. (USA). Das Buchungsfenster wird erst geladen, wenn du auf „Termin“ klickst – vorher werden keine Daten an Cal.com übertragen. Bei der Buchung verarbeitet Cal.com deine Angaben (z. B. Name, E-Mail, Terminwunsch) zur Terminvereinbarung (Art. 6 Abs. 1 lit. b DSGVO). Dabei kann eine Übermittlung in die USA stattfinden.',
    ],
  },
  {
    title: 'KI-Techniker (Google Gemini)',
    body: [
      'Wenn du den KI-Techniker nutzt, wird deine Fehlerbeschreibung über unseren Server an die Gemini-Schnittstelle von Google übermittelt, um eine automatische Ersteinschätzung zu erstellen. Angehängte Fotos werden dabei nicht an Google weitergegeben und nicht gespeichert.',
      'Bitte gib im Chat keine Namen, Telefonnummern oder Passwörter ein. Rechtsgrundlage ist deine Anfrage (Art. 6 Abs. 1 lit. b DSGVO). Die Antwort ist unverbindlich und ersetzt keine Prüfung am Gerät.',
    ],
  },
  {
    title: 'Reparaturstatus-Abfrage',
    body: [
      'Für die Statusabfrage werden Auftragsnummer und die letzten vier Ziffern deiner Telefonnummer an unseren Server gesendet und mit dem Auftrag abgeglichen. Angezeigt werden nur Status, Gerät, Datum und deine Initialen.',
      'Zum Schutz vor dem Durchprobieren fremder Auftragsnummern speichern wir bei Fehlversuchen kurzzeitig die IP-Adresse; dieser Eintrag wird nach spätestens 24 Stunden gelöscht (Art. 6 Abs. 1 lit. f DSGVO).',
    ],
  },
  {
    title: 'Gerätedaten und Passwörter',
    body: [
      'Passcodes oder Entsperr-PINs werden niemals online abgefragt oder gespeichert. Die Übergabe erfolgt ausschließlich persönlich bei der Geräteabgabe. Auf private Inhalte deines Geräts greifen wir nur zu, soweit es für die Reparatur oder Datenrettung zwingend nötig ist.',
    ],
  },
  {
    title: 'Speicherdauer',
    body: [
      'Auftragsdaten speichern wir, solange sie für die Reparatur, Garantie und gesetzliche Aufbewahrungspflichten (z. B. Rechnungen: 10 Jahre nach HGB/AO) benötigt werden. Danach werden sie gelöscht.',
    ],
  },
  {
    title: 'Deine Rechte',
    body: [
      'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen. Eine Nachricht an die oben genannten Kontaktdaten genügt.',
      'Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, z. B. beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.',
    ],
  },
];

interface LegalModalsProps {
  modalType: 'impressum' | 'datenschutz' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={modalType === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="bg-[#0B1315] border border-[#C9743F]/40 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute top-5 right-5 text-[#839897] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {modalType === 'impressum' ? (
          <div className="space-y-4 text-xs sm:text-sm text-[#839897] leading-relaxed">
            <h3 className="font-mono text-base sm:text-lg font-bold text-[#00F5D4] mb-3">
              Impressum
            </h3>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">Angaben gemäß § 5 DDG:</strong>
              <p>
                CODE IT-Werkstatt<br />
                Inhaber: Mustafa Al-Zurgany<br />
                92318 Neumarkt in der Oberpfalz<br />
                Deutschland
              </p>
            </div>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">Kontakt:</strong>
              <p>
                Telefon: +49 (0) 176 4174 4443<br />
                E-Mail: mustafa.alzurgany@gmail.com<br />
                Web: www.code-ger.de
              </p>
            </div>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">Steuerliche Erfassung:</strong>
              <p>
                Finanzamt Neumarkt i.d.OPf.<br />
                Steuernummer: [Wird nach Erteilung ergänzt / Kleinunternehmerregelung gem. § 19 UStG]
              </p>
            </div>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong>
              <p>
                Mustafa Al-Zurgany, 92318 Neumarkt in der Oberpfalz
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-[#839897] leading-relaxed">
            <h3 className="font-mono text-base sm:text-lg font-bold text-[#00F5D4] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00F5D4]" />
              <span>Datenschutzerklärung</span>
            </h3>

            {PRIVACY_SECTIONS.map((section, i) => (
              <div key={section.title}>
                <strong className="text-white block font-mono text-xs mb-1">
                  {i + 1}. {section.title}
                </strong>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mb-1.5 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
            <p className="text-[11px] text-[#5F7473] pt-2">Stand: Oktober 2026</p>
          </div>
        )}
      </div>
    </div>
  );
};
