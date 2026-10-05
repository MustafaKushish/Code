import React from 'react';
import { X, FileText, Printer } from 'lucide-react';
import { Order, WorkshopSettings } from './types';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  mode: 'invoice' | 'kva';
  workshopSettings: WorkshopSettings;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  order,
  mode,
  workshopSettings,
}) => {
  if (!isOpen || !order) return null;

  const isInvoice = mode === 'invoice';
  const docTitle = isInvoice ? 'RECHNUNG' : 'KOSTENVORANSCHLAG';
  const docNumber = isInvoice ? order.id : order.id.replace(/^RE-/, 'KVA-');

  const laborPartVal =
    order.rawSubtotalNet === undefined
      ? order.netto - (order.partVKNet || 0) - (order.consumables || 0) - (order.express || 0)
      : order.rawSubtotalNet - (order.partVKNet || 0) - (order.consumables || 0) - (order.express || 0);

  const handlePrint = () => {
    const className = isInvoice ? 'print-mode-invoice' : 'print-mode-kva';
    document.body.classList.add(className);
    window.print();
    setTimeout(() => {
      document.body.classList.remove(className);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#0B1416] border border-[#00F5D4]/40 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
              {isInvoice ? <FileText className="w-5 h-5" /> : <FileText className="w-5 h-5 text-[#FF8D4D]" />}
            </div>
            <div>
              <h3 className="font-mono text-sm sm:text-base font-black text-white">
                {isInvoice ? 'Kundenrechnung DIN-A4' : 'Kostenvoranschlag (KVA)'}
              </h3>
              <p className="text-[10px] font-mono text-[#00F5D4] font-bold">
                // VORSCHAU &amp; DRUCKBEREIT FÜR {docNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase bg-[#00F5D4] text-black hover:bg-[#00F5D4]/85 transition cursor-pointer shadow-md shadow-[#00F5D4]/20"
            >
              <Printer className="w-3.5 h-3.5 text-black" />
              <span>Drucken / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#859B9E] hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="overflow-y-auto pr-1 flex-1 select-text">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-inner font-sans text-xs leading-relaxed border border-gray-300">
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-[#00F5D4] shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#00F5D4" strokeWidth="2" />
                    <rect x="8" y="8" width="8" height="8" rx="1" fill="#C9743F" stroke="#C9743F" />
                    <path d="M12 1v3M12 20v3M1 12h3M20 12h3M6 1v3M6 20v3M1 6h3M20 6h3M18 1v3M18 20v3M1 18h3M20 18h3" stroke="#00F5D4" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-black tracking-tight text-slate-900">
                    CODE <span className="text-[#C9743F]">// WERKSTATT</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                    Elektronik- &amp; Platinen-Instandsetzung • SMD-Mikrolöten
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {workshopSettings.ownerName} • {workshopSettings.address} • Tel: {workshopSettings.phone}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-black tracking-wide text-slate-900 uppercase">
                  {docTitle}
                </div>
                <div className="text-xs font-bold text-[#C9743F] font-mono mt-0.5">
                  Nr. {docNumber}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Datum: <strong>{order.date}</strong>
                </div>
              </div>
            </div>

            {/* Customer & Device Meta Row */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-[52%]">
                <div className="text-[9px] underline text-slate-400 mb-2">
                  CODE IT-Werkstatt • {workshopSettings.ownerName} • {workshopSettings.address}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {order.isB2B ? 'Firma / Partner: ' : ''}
                  {order.cust}
                </div>
                <div className="text-xs text-slate-700 mt-1 whitespace-pre-line">
                  {order.address || 'Kunde ohne Adressangabe (Thekenkunde/Barzahler)'}
                </div>
                {order.phone && <div className="text-[11px] text-slate-500 mt-1">Tel: {order.phone}</div>}
              </div>

              <div className="w-[44%] bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] space-y-1.5">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Repariertes Gerät:</span>
                  <strong className="text-slate-900">{order.device}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Serien- / IMEI-Nr.:</span>
                  <span className="font-mono font-semibold">{order.serial || '–'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Zahlungsart:</span>
                  <strong>{order.payMethod || 'Barzahlung'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <strong className={order.paid === 'Bezahlt' ? 'text-emerald-700' : 'text-amber-700'}>
                    {order.paid === 'Bezahlt' ? '✓ Vollständig bezahlt' : 'Zahlung ausstehend (14 Tage)'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full border-collapse text-[11.5px] mb-5">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10.5px]">
                  <th className="p-2 text-center w-10">Pos.</th>
                  <th className="p-2 text-left w-24">Art.-Nr.</th>
                  <th className="p-2 text-left">Leistungsbeschreibung &amp; Komponenten</th>
                  <th className="p-2 text-center w-16">Menge</th>
                  <th className="p-2 text-right w-14">USt.</th>
                  <th className="p-2 text-right w-24">Einzel Netto</th>
                  <th className="p-2 text-right w-24">Gesamt Netto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                <tr>
                  <td className="p-2.5 text-center font-bold">01</td>
                  <td className="p-2.5 font-mono text-slate-500">SRV-SMD</td>
                  <td className="p-2.5">
                    <strong className="text-slate-900">Fachgerechte Fehlerdiagnose &amp; SMD-Mikrolötreparatur</strong>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Gerät: {order.device}
                      {order.min ? ` • Netto-Arbeitszeit: ${order.min} Min.` : ''}
                    </div>
                  </td>
                  <td className="p-2.5 text-center">1 pausch.</td>
                  <td className="p-2.5 text-right">{order.taxRate} %</td>
                  <td className="p-2.5 text-right">{Math.max(0, laborPartVal).toFixed(2)} €</td>
                  <td className="p-2.5 text-right font-bold">{Math.max(0, laborPartVal).toFixed(2)} €</td>
                </tr>

                {(order.partVKNet || 0) > 0 && (
                  <tr className="bg-slate-50">
                    <td className="p-2.5 text-center font-bold">02</td>
                    <td className="p-2.5 font-mono text-slate-500">PART-OEM</td>
                    <td className="p-2.5">
                      <strong className="text-slate-900">Spezifisches Elektronik-Ersatzteil / SMD-Chip</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Geprüftes Bauteil in Erstausrüsterqualität (OEM)
                      </div>
                    </td>
                    <td className="p-2.5 text-center">1 Stk.</td>
                    <td className="p-2.5 text-right">{order.taxRate} %</td>
                    <td className="p-2.5 text-right">{(order.partVKNet || 0).toFixed(2)} €</td>
                    <td className="p-2.5 text-right font-bold">{(order.partVKNet || 0).toFixed(2)} €</td>
                  </tr>
                )}

                {(order.consumables || 0) > 0 && (
                  <tr>
                    <td className="p-2.5 text-center font-bold">03</td>
                    <td className="p-2.5 font-mono text-slate-500">MAT-SMD</td>
                    <td className="p-2.5">
                      <strong className="text-slate-900">Verbrauchsmaterialien &amp; Spezial-Schutzmittel</strong>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Amtech No-Clean Flussmittel, Thermal Grizzly Flüssigmetall
                      </div>
                    </td>
                    <td className="p-2.5 text-center">1 Pos.</td>
                    <td className="p-2.5 text-right">{order.taxRate} %</td>
                    <td className="p-2.5 text-right">{(order.consumables || 0).toFixed(2)} €</td>
                    <td className="p-2.5 text-right font-bold">{(order.consumables || 0).toFixed(2)} €</td>
                  </tr>
                )}

                {(order.express || 0) > 0 && (
                  <tr className="bg-amber-50">
                    <td className="p-2.5 text-center font-bold">04</td>
                    <td className="p-2.5 font-mono text-amber-700">SRV-EXP</td>
                    <td className="p-2.5">
                      <strong className="text-amber-800">⚡ Express-Prioritätsabwicklung (Same-Day / 24h)</strong>
                      <div className="text-[10px] text-amber-700 mt-0.5">
                        Sofortige vorrangige Diagnose &amp; Bearbeitung
                      </div>
                    </td>
                    <td className="p-2.5 text-center">1 Pos.</td>
                    <td className="p-2.5 text-right">{order.taxRate} %</td>
                    <td className="p-2.5 text-right">{(order.express || 0).toFixed(2)} €</td>
                    <td className="p-2.5 text-right font-bold text-amber-800">
                      {(order.express || 0).toFixed(2)} €
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals & Notes */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-[50%] text-[11px] text-slate-600 space-y-2">
                <div className="bg-slate-50 border-l-3 border-[#00F5D4] p-2.5 rounded-r-lg">
                  <strong className="text-slate-900 block mb-0.5">🛡️ 6 Monate Werkstattgarantie:</strong>
                  Auf durchgeführte Lötstellen und ersetzte Originalbauteile gewähren wir 6 Monate Gewährleistung ab Leistungsdatum.
                </div>
                <div>
                  {order.isB2B ? (
                    <div>✓ Zahlungsziel: <strong>14 Tage rein netto</strong> ohne Abzug.</div>
                  ) : (
                    <div>✓ Betrag vollständig beglichen per <strong>{order.payMethod || 'Barzahlung'}</strong>. Vielen Dank!</div>
                  )}
                </div>
              </div>

              <div className="w-[44%] bg-white border border-slate-300 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-700">
                  <span>Gesamtsumme Netto:</span>
                  <strong>{order.netto.toFixed(2)} €</strong>
                </div>
                {order.taxRate > 0 ? (
                  <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-1.5">
                    <span>zzgl. {order.taxRate} % MwSt.:</span>
                    <strong>{order.taxAmount.toFixed(2)} €</strong>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                    Gemäß § 19 UStG wird keine USt berechnet.
                  </div>
                )}
                <div className="flex justify-between items-center bg-slate-900 text-white p-2.5 rounded-md text-sm font-bold mt-2">
                  <span>RECHNUNGSBETRAG:</span>
                  <span className="text-base text-[#00F5D4]">{order.brutto.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="border-t border-slate-300 pt-3 text-[9.5px] text-slate-500 flex justify-between">
              <div>
                <strong className="text-slate-800">CODE // WERKSTATT</strong>
                <br />
                {workshopSettings.ownerName}
                <br />
                {workshopSettings.address}
              </div>
              <div>
                <strong className="text-slate-800">KONTAKT</strong>
                <br />
                Tel: {workshopSettings.phone}
                <br />
                E-Mail: {workshopSettings.email}
              </div>
              <div>
                <strong className="text-slate-800">STEUER- &amp; BANKDATEN</strong>
                <br />
                Finanzamt Neumarkt i.d.OPf.
                <br />
                Steuernummer: In Steuerakte
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 shrink-0">
          <div className="text-[11px] font-mono text-[#859B9E]">
            💡 Tipp: „Drucken / PDF“ öffnet den Browser-Drucker zum direkten Drucken oder Speichern als PDF.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
            >
              Schließen
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase bg-[#00F5D4] text-black hover:bg-[#00F5D4]/85 transition cursor-pointer shadow-lg shadow-[#00F5D4]/20"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Jetzt Drucken / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
