import React from 'react';
import { Order, TaxReportPayload } from './types';

interface PrintTemplatesProps {
  invoiceData: Partial<Order> | null;
  kvaData: Partial<Order> | null;
  taxReportData: TaxReportPayload | null;
}

export const PrintTemplates: React.FC<PrintTemplatesProps> = ({
  invoiceData,
  kvaData,
  taxReportData,
}) => {
  const invLaborNet = invoiceData
    ? invoiceData.rawSubtotalNet === undefined
      ? invoiceData.netto! -
        (invoiceData.partVKNet || 0) -
        (invoiceData.consumables || 0) -
        (invoiceData.express || 0)
      : invoiceData.rawSubtotalNet -
        (invoiceData.partVKNet || 0) -
        (invoiceData.consumables || 0) -
        (invoiceData.express || 0)
    : 0;

  const kvaLaborNet = kvaData ? (kvaData.min! / 60) * (kvaData.rate || 85) : 0;

  return (
    <>
      {/* 1. Print Invoice Template */}
      <div id="printInvoiceArea">
        {invoiceData && (
          <div
            style={{
              maxWidth: '780px',
              margin: '0 auto',
              color: '#0f172a',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
              fontSize: '12px',
              lineHeight: 1.45,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2.5px solid #0f172a',
                paddingBottom: '16px',
                marginBottom: '22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    background: '#0f172a',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00F5D4',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#00F5D4" strokeWidth="2" />
                    <rect x="8" y="8" width="8" height="8" rx="1" fill="#C9743F" stroke="#C9743F" />
                    <path d="M12 1v3M12 20v3M1 12h3M20 12h3M6 1v3M6 20v3M1 6h3M20 6h3M18 1v3M18 20v3M1 18h3M20 18h3" stroke="#00F5D4" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '0.8px', color: '#0f172a', margin: 0 }}>
                    CODE <span style={{ color: '#C9743F' }}>// WERKSTATT</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>
                    Elektronik- &amp; Platinen-Instandsetzung • SMD-Mikrolöten
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '3px' }}>
                    Inh. Mustafa Al-Zurgany • 92318 Neumarkt in der Oberpfalz • Tel: 0176 4174 4443
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '1px', color: '#0f172a', textTransform: 'uppercase' }}>
                  RECHNUNG
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#C9743F', marginTop: '4px' }}>
                  Nr. {invoiceData.id}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                  Rechnungsdatum: <strong>{invoiceData.invoiceDate || invoiceData.date}</strong>
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  Leistungsdatum: {invoiceData.serviceDate || invoiceData.date}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ width: '52%' }}>
                <div style={{ fontSize: '9px', textDecoration: 'underline', color: '#64748b', marginBottom: '8px' }}>
                  CODE IT-Werkstatt • Mustafa Al-Zurgany • 92318 Neumarkt i.d.OPf.
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>
                  {invoiceData.isB2B ? 'Firma / Partner: ' : ''}{invoiceData.cust}
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px', whiteSpace: 'pre-line' }}>
                  {invoiceData.address || 'Kunde ohne Anschrift (Barzahler/Thekenkunde)'}
                </div>
                {invoiceData.phone && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    Mobil / Tel: {invoiceData.phone}
                  </div>
                )}
              </div>

              <div style={{ width: '44%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>Gerät / Modell:</span>
                  <strong style={{ color: '#0f172a' }}>{invoiceData.device}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>Serien- / IMEI-Nr.:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{invoiceData.serial || '–'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
                  <span style={{ color: '#64748b' }}>Zahlungsart:</span>
                  <strong>{invoiceData.payMethod || (invoiceData.isB2B ? 'Banküberweisung (14 Tage)' : 'Barzahlung')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Zahlungsstatus:</span>
                  <span style={{ fontWeight: 'bold', color: invoiceData.paid === 'Bezahlt' ? '#059669' : '#d97706' }}>
                    {invoiceData.paid === 'Bezahlt' ? '✓ Vollständig bezahlt' : 'Ausstehend (Zahlungsziel 14 Tage)'}
                  </span>
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '38px', borderRadius: '4px 0 0 0' }}>Pos.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '85px' }}>Art.-Nr.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Bezeichnung / Leistungsbeschreibung &amp; Komponenten</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Menge</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '55px' }}>USt.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '90px' }}>Einzel Netto</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '95px', borderRadius: '0 4px 0 0' }}>Gesamt Netto</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 'bold' }}>01</td>
                  <td style={{ padding: '9px 10px', fontFamily: 'monospace', color: '#64748b' }}>SRV-SMD</td>
                  <td style={{ padding: '9px 10px' }}>
                    <strong style={{ color: '#0f172a' }}>Fachgerechte Fehlerdiagnose &amp; SMD-Mikrolötreparatur</strong>
                    <div style={{ color: '#64748b', fontSize: '10.5px', marginTop: '1px' }}>
                      Gerätebearbeitung: {invoiceData.device}
                      {invoiceData.min ? ` • Netto-Arbeitszeit: ${invoiceData.min} Min.` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>1 pausch.</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right' }}>{invoiceData.taxRate} %</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                    {Math.max(0, invLaborNet).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 'bold' }}>
                    {Math.max(0, invLaborNet).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                </tr>

                {(invoiceData.partVKNet || 0) > 0 && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 'bold' }}>02</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'monospace', color: '#64748b' }}>PART-OEM</td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ color: '#0f172a' }}>Spezifisches Elektronik-Ersatzteil / SMD-Komponente</strong>
                      <div style={{ color: '#64748b', fontSize: '10.5px', marginTop: '1px' }}>
                        Qualitätsgeprüfte Werkstatt-Komponente in Erstausrüsterqualität (OEM)
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>1 Stk.</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>{invoiceData.taxRate} %</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                      {(invoiceData.partVKNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 'bold' }}>
                      {(invoiceData.partVKNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                  </tr>
                )}

                {(invoiceData.consumables || 0) > 0 && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 'bold' }}>03</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'monospace', color: '#64748b' }}>MAT-SMD</td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ color: '#0f172a' }}>Verbrauchsmaterialien &amp; Spezial-Schutzmittel</strong>
                      <div style={{ color: '#64748b', fontSize: '10.5px', marginTop: '1px' }}>
                        Amtech No-Clean Flussmittel, Thermal Grizzly Flüssigmetall / K5 Pro Wärmeleitpads
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>1 Pos.</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>{invoiceData.taxRate} %</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                      {(invoiceData.consumables || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 'bold' }}>
                      {(invoiceData.consumables || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                  </tr>
                )}

                {(invoiceData.express || 0) > 0 && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 'bold' }}>04</td>
                    <td style={{ padding: '9px 10px', fontFamily: 'monospace', color: '#b45309' }}>SRV-EXP</td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ color: '#b45309' }}>⚡ Express-Prioritätsabwicklung (Same-Day / 24h Werkbank)</strong>
                      <div style={{ color: '#92400e', fontSize: '10.5px', marginTop: '1px' }}>
                        Sofortige vorrangige Diagnose und Instandsetzung ohne Wartezeit
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>1 Pos.</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>{invoiceData.taxRate} %</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                      {(invoiceData.express || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 'bold', color: '#b45309' }}>
                      {(invoiceData.express || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ width: '50%', fontSize: '11px', color: '#334155', lineHeight: 1.55 }}>
                <div style={{ background: '#f8fafc', borderLeft: '3px solid #00F5D4', padding: '8px 12px', borderRadius: '0 6px 6px 0', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a' }}>🛡️ 6 Monate Werkstattgarantie:</strong><br />
                  Auf alle durchgeführten Lötstellen und ersetzten Originalbauteile gewähren wir 6 Monate Garantie ab Leistungsdatum.
                </div>
                <div style={{ color: '#475569' }}>
                  {invoiceData.isB2B ? (
                    <div>✓ Zahlungsziel: <strong>14 Tage rein netto</strong> ohne Abzug auf unser angegebenes Geschäftskonto.</div>
                  ) : (
                    <div>✓ Betrag dankend erhalten per <strong>{invoiceData.payMethod || 'Barzahlung'}</strong>. Vielen Dank für Ihren Auftrag!</div>
                  )}
                </div>
              </div>

              <div style={{ width: '42%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                {invoiceData.isB2B && (invoiceData.b2bDiscountVal || 0) > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                      <span>Zwischensumme Netto:</span>
                      <strong>{(invoiceData.rawSubtotalNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#059669' }}>
                      <span>B2B-Partner-Rabatt ({invoiceData.b2bDiscountPercent}%):</span>
                      <strong>-{(invoiceData.b2bDiscountVal || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontWeight: 600, color: '#334155' }}>
                  <span>Gesamtsumme Netto:</span>
                  <strong>{invoiceData.netto!.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                </div>
                {invoiceData.taxRate! > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span>zzgl. {invoiceData.taxRate} % MwSt.:</span>
                    <strong>{invoiceData.taxAmount!.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                  </div>
                ) : (
                  <div style={{ fontSize: '10px', color: '#64748b', padding: '3px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '8px 10px', background: '#0f172a', color: '#ffffff', borderRadius: '6px', fontSize: '15px', fontWeight: 800 }}>
                  <span style={{ letterSpacing: '0.5px' }}>RECHNUNGSBETRAG:</span>
                  <span style={{ fontSize: '17px', color: '#00F5D4' }}>{invoiceData.brutto!.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginTop: '26px', fontSize: '9.5px', color: '#64748b', display: 'flex', justifyContent: 'space-between', lineHeight: 1.45 }}>
              <div>
                <strong style={{ color: '#0f172a' }}>CODE // WERKSTATT</strong><br />
                Inhaber: Mustafa Al-Zurgany<br />
                92318 Neumarkt in der Oberpfalz<br />
                Deutschland
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>KONTAKT &amp; SERVICE</strong><br />
                Telefon / WA: 0176 4174 4443<br />
                E-Mail: info@code-ger.com<br />
                Internet: www.code-ger.de
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>BANK &amp; STEUERDATEN</strong><br />
                Finanzamt Neumarkt i.d.OPf.<br />
                Steuernummer: In Steuerakte hinterlegt<br />
                Gerichtsstand: Neumarkt i.d.OPf.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Print KVA Template */}
      <div id="printKvaArea">
        {kvaData && (
          <div
            style={{
              maxWidth: '780px',
              margin: '0 auto',
              color: '#0f172a',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
              fontSize: '12px',
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '22px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>CODE // WERKSTATT</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Inh. Mustafa Al-Zurgany • 92318 Neumarkt i.d.OPf. • Tel: 0176 4174 4443</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#C9743F' }}>KOSTENVORANSCHLAG</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>KVA-Nr.: {kvaData.id}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Datum: {kvaData.date}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Kunde:</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{kvaData.cust}</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>{kvaData.address || '–'} • Tel: {kvaData.phone}</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}><strong>Gerät:</strong> {kvaData.device} (S/N: {kvaData.serial || '–'})</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Leistungsposition</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '70px' }}>Menge</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '110px' }}>Betrag Netto</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>
                    <strong>Fehlerdiagnose &amp; SMD-Reparaturaufwand</strong><br />
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Geplante Arbeitszeit: {kvaData.min} Min.</span>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>1 pausch.</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{kvaLaborNet.toFixed(2)} €</td>
                </tr>
                {(kvaData.partVKNet || 0) > 0 && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>
                      <strong>Voraussichtliche Ersatzteile</strong><br />
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Qualitätskomponenten in Erstausrüsterqualität</span>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>1 Pos.</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{(kvaData.partVKNet || 0).toFixed(2)} €</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ width: '320px', marginLeft: 'auto', marginBottom: '24px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span>Summe Netto:</span>
                <strong>{kvaData.netto!.toFixed(2)} €</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span>zzgl. {kvaData.taxRate} % MwSt.:</span>
                <strong>{kvaData.taxAmount!.toFixed(2)} €</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid #0f172a', fontSize: '14px', fontWeight: 'bold' }}>
                <span>Voraussichtlicher Endbetrag:</span>
                <span style={{ color: '#C9743F' }}>{kvaData.brutto!.toFixed(2)} €</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', fontSize: '10.5px', color: '#475569' }}>
              Dieser Kostenvoranschlag ist freibleibend für 14 Tage gültig. Bei Reparaturbeauftragung wird die Diagnosepauschale vollständig verrechnet.
            </div>
          </div>
        )}
      </div>

      {/* 3. Print Tax / DATEV Template */}
      <div id="printTaxArea">
        {taxReportData && (
          <div style={{ maxWidth: '800px', margin: '0 auto', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>CODE // IT-WERKSTATT</div>
                <div style={{ fontSize: '11px', color: '#555' }}>Steuer- &amp; Buchhaltungsübersicht (DATEV Vorbereitung)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{taxReportData.periodLabel}</div>
                <div style={{ fontSize: '10px', color: '#555' }}>Druckdatum: {taxReportData.printDate}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Rechnungs-Nr.</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Datum</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Kunde</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Gerät</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>USt</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Netto</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>MwSt</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Brutto</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Teile-EK</th>
                </tr>
              </thead>
              <tbody>
                {taxReportData.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '5px' }}><strong>{item.id}</strong></td>
                    <td style={{ padding: '5px' }}>{item.date}</td>
                    <td style={{ padding: '5px' }}>{item.cust}</td>
                    <td style={{ padding: '5px' }}>{item.device}</td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>{item.taxRate} %</td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>{item.netto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>{item.taxAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                    <td style={{ padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>{item.brutto.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                    <td style={{ padding: '5px', textAlign: 'right' }}>{(item.partEK || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
