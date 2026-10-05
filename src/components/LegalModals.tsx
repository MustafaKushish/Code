import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalsProps {
  modalType: 'impressum' | 'datenschutz' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0B1315] border border-[#C9743F]/40 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative my-auto">
        <button
          type="button"
          onClick={onClose}
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
                Web: code-ger.com
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

            <p>
              Der Schutz deiner persönlichen Daten ist uns ein elementares Anliegen. Diese Webanwendung dient als Informations- und Vorab-Check-in-Portal für unsere Werkstatt in Neumarkt in der Oberpfalz.
            </p>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">1. Erfassung technischer Daten &amp; Server-Logfiles</strong>
              <p>
                Beim Aufruf unserer Website speichert der Server technisch notwendige Verbindungsdaten (z. B. IP-Adresse, Timestamp), um die Stabilität und Sicherheit der Systeme zu gewährleisten.
              </p>
            </div>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">2. Kontaktaufnahme &amp; Reparatur-Check-in</strong>
              <p>
                Wenn du uns über das Online-Formular, WhatsApp oder Telefon kontaktierst, werden die übermittelten Angaben ausschließlich zur Bearbeitung deiner Reparaturanfrage, Durchführung des Auftrags und eventuelle Rückfragen gespeichert. Es erfolgt keine Weitergabe an unbefugte Dritte.
              </p>
            </div>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">3. Lokale Datenspeicherung &amp; Passwörter</strong>
              <p>
                Passcodes oder Entsperr-PINs für Geräte werden niemals online abgefragt oder in Datenbanken gespeichert. Die Übergabe erfolgt ausschließlich persönlich und mündlich bei Vor-Ort-Abgabe.
              </p>
            </div>

            <div>
              <strong className="text-white block font-mono text-xs mb-1">4. Deine Rechte</strong>
              <p>
                Du hast jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
