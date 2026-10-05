import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  RotateCcw,
  CheckCircle,
  Package,
  Save,
  Printer,
  FileText,
  Building2,
} from 'lucide-react';
import { InventoryItem, Order } from './types';

interface CalculatorViewProps {
  inventory: InventoryItem[];
  onSaveOrder: (orderData: Partial<Order>, linkedPartId?: string) => void;
  onPrintInvoice: (orderData: Partial<Order>) => void;
  onPrintKva: (orderData: Partial<Order>) => void;
}

const DRAFT_STORAGE_KEY = 'code_calculator_draft_v1';

function getStoredDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const PRESETS: Record<string, { dev: string; min: number; ek: number; markup: number; cons: number; newP: number }> = {
  ps5_hdmi: {
    dev: 'Sony PlayStation 5 — HDMI-Port Austausch',
    min: 45,
    ek: 7.5,
    markup: 50,
    cons: 4.5,
    newP: 500,
  },
  ps5_liquid: {
    dev: 'Sony PS5 — Flüssigmetall Erneuerung & Kühler-Politur',
    min: 40,
    ek: 6,
    markup: 40,
    cons: 4,
    newP: 500,
  },
  hall_dual: {
    dev: 'DualSense PS5 — 2x Hall-Effect Magnet-Sticks (Anti-Drift)',
    min: 40,
    ek: 11.5,
    markup: 40,
    cons: 4,
    newP: 75,
  },
  autoschluessel: {
    dev: 'Autoschlüssel — Mikrotaster & SMD Leiterbahnen',
    min: 25,
    ek: 3.5,
    markup: 60,
    cons: 3,
    newP: 350,
  },
  laptop_kurzschluss: {
    dev: 'Laptop Logicboard — 19V Hauptschienen-Kurzschluss',
    min: 70,
    ek: 14,
    markup: 50,
    cons: 5.5,
    newP: 650,
  },
  datenrettung: {
    dev: 'Chip-Level Notfall-Datenrettung (No Data - No Fee)',
    min: 90,
    ek: 15,
    markup: 50,
    cons: 6,
    newP: 450,
  },
};

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  inventory,
  onSaveOrder,
  onPrintInvoice,
  onPrintKva,
}) => {
  const [draft] = useState(() => getStoredDraft());

  const [custName, setCustName] = useState<string>(draft?.custName ?? '');
  const [custPhone, setCustPhone] = useState<string>(draft?.custPhone ?? '');
  const [custAddress, setCustAddress] = useState<string>(draft?.custAddress ?? '');
  const [custDevice, setCustDevice] = useState<string>(draft?.custDevice ?? '');
  const [custSerial, setCustSerial] = useState<string>(draft?.custSerial ?? '');

  const [minutes, setMinutes] = useState<number>(draft?.minutes ?? 45);
  const [hourlyRate, setHourlyRate] = useState<number>(draft?.hourlyRate ?? 85);

  const [selectedPartId, setSelectedPartId] = useState<string>(draft?.selectedPartId ?? '');
  const [partEK, setPartEK] = useState<number>(draft?.partEK ?? 8);
  const [partMarkup, setPartMarkup] = useState<number>(draft?.partMarkup ?? 50);

  const [consumables, setConsumables] = useState<number>(draft?.consumables ?? 4.5);
  const [overhead, setOverhead] = useState<number>(draft?.overhead ?? 6);
  const [warrantyRisk, setWarrantyRisk] = useState<number>(draft?.warrantyRisk ?? 5);
  const [express, setExpress] = useState<number>(draft?.express ?? 0);
  const [taxRate, setTaxRate] = useState<number>(draft?.taxRate ?? 19);
  const [payMethod, setPayMethod] = useState<string>(draft?.payMethod ?? 'Barzahlung');
  const [newDevicePrice, setNewDevicePrice] = useState<number>(draft?.newDevicePrice ?? 500);

  const [isB2B, setIsB2B] = useState<boolean>(draft?.isB2B ?? false);
  const [b2bDiscount, setB2bDiscount] = useState<number>(draft?.b2bDiscount ?? 25);

  const [lastSaved, setLastSaved] = useState<string | null>(() =>
    draft?.lastSaved
      ? new Date(draft.lastSaved).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : null
  );

  const formValuesRef = useRef({
    custName,
    custPhone,
    custAddress,
    custDevice,
    custSerial,
    minutes,
    hourlyRate,
    selectedPartId,
    partEK,
    partMarkup,
    consumables,
    overhead,
    warrantyRisk,
    express,
    taxRate,
    payMethod,
    newDevicePrice,
    isB2B,
    b2bDiscount,
  });

  useEffect(() => {
    formValuesRef.current = {
      custName,
      custPhone,
      custAddress,
      custDevice,
      custSerial,
      minutes,
      hourlyRate,
      selectedPartId,
      partEK,
      partMarkup,
      consumables,
      overhead,
      warrantyRisk,
      express,
      taxRate,
      payMethod,
      newDevicePrice,
      isB2B,
      b2bDiscount,
    };
  }, [
    custName,
    custPhone,
    custAddress,
    custDevice,
    custSerial,
    minutes,
    hourlyRate,
    selectedPartId,
    partEK,
    partMarkup,
    consumables,
    overhead,
    warrantyRisk,
    express,
    taxRate,
    payMethod,
    newDevicePrice,
    isB2B,
    b2bDiscount,
  ]);

  // Auto-save draft
  useEffect(() => {
    const save = () => {
      const payload = {
        ...formValuesRef.current,
        lastSaved: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
        setLastSaved(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Auto-save draft failed:', err);
      }
    };

    const interval = setInterval(save, 5000);
    const beforeUnload = () => {
      save();
    };
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', beforeUnload);
      save();
    };
  }, []);

  const handleApplyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      setSelectedPartId('');
      setCustDevice(preset.dev);
      setMinutes(preset.min);
      setPartEK(preset.ek);
      setPartMarkup(preset.markup);
      setConsumables(preset.cons);
      setNewDevicePrice(preset.newP);
    }
  };

  const handleSelectPart = (id: string) => {
    setSelectedPartId(id);
    if (!id) return;
    const part = inventory.find((p) => p.id === id);
    if (part) {
      setPartEK(part.ek);
    }
  };

  // Calculations
  const laborNet = (minutes / 60) * hourlyRate;
  const partVKNet = partEK * (1 + partMarkup / 100);
  const costSumNet = laborNet + partVKNet + consumables + overhead + express;
  const warrantyValNet = (warrantyRisk / 100) * costSumNet;
  const rawSubtotalNet = costSumNet + warrantyValNet;

  const b2bDiscountVal = isB2B ? (b2bDiscount / 100) * rawSubtotalNet : 0;
  const netTotal = rawSubtotalNet - b2bDiscountVal;
  const taxAmount = (taxRate / 100) * netTotal;
  const bruttoTotal = netTotal + taxAmount;

  const profitNet = netTotal - partEK - consumables;
  const marginPercent = netTotal > 0 ? (profitNet / netTotal) * 100 : 0;
  const customerSavings = Math.max(0, newDevicePrice - bruttoTotal);

  const getPayload = (): Partial<Order> => {
    const today = new Date().toLocaleDateString('de-DE');
    return {
      cust: custName.trim() || 'Direktkunde',
      phone: custPhone.trim() || '–',
      address: custAddress.trim() || '',
      device: custDevice.trim() || 'Elektronik-Reparatur',
      serial: custSerial.trim() || '–',
      payMethod,
      isB2B,
      b2bDiscountPercent: isB2B ? b2bDiscount : 0,
      b2bDiscountVal,
      rawSubtotalNet,
      min: minutes,
      rate: hourlyRate,
      partEK,
      partVKNet,
      consumables,
      overhead,
      express,
      netto: netTotal,
      taxRate,
      taxAmount,
      brutto: bruttoTotal,
      profit: profitNet,
      date: today,
      serviceDate: today,
      status: 'Eingegangen',
      paid: isB2B ? 'Offen' : 'Bezahlt',
      newPrice: newDevicePrice,
    };
  };

  const handleResetForm = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setLastSaved(null);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustDevice('');
    setCustSerial('');
    setSelectedPartId('');
    setMinutes(45);
    setHourlyRate(85);
    setPartEK(8);
    setPartMarkup(50);
    setConsumables(4.5);
    setOverhead(6);
    setWarrantyRisk(5);
    setExpress(0);
    setTaxRate(19);
    setPayMethod('Barzahlung');
    setNewDevicePrice(500);
    setIsB2B(false);
    setB2bDiscount(25);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Left Column: Form */}
      <div className="lg:col-span-7 bg-[#0B1416] border border-[#C9743F]/30 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/50 space-y-5">
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
          <div className="font-mono text-xs sm:text-sm font-bold text-[#00F5D4] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#C9743F]" />
            <span>PARALLEL-KALKULATION (CHIP-LEVEL &amp; HARDWARE)</span>
          </div>

          <div className="flex items-center gap-2.5">
            {lastSaved && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30"
                title="Wird alle 5 Sekunden automatisch gesichert"
              >
                <CheckCircle className="w-3 h-3 text-[#00E676]" />
                <span>Entwurf auto-gesichert ({lastSaved})</span>
              </span>
            )}

            {(custName || custDevice || custPhone || custAddress) && (
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-[#859B9E] hover:text-[#FF5252] transition cursor-pointer"
                title="Entwurf verwerfen und Formular zurücksetzen"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Entwurf leeren</span>
              </button>
            )}

            <span className="text-[11px] font-mono text-[#FF8D4D] font-bold">
              92318 NEUMARKT
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1.5">
            Schnellvorlage laden:
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('ps5_hdmi')}
              className="px-2.5 py-1 text-xs font-mono rounded-full bg-[#C9743F]/15 border border-[#C9743F] text-white hover:bg-[#C9743F] hover:text-black transition cursor-pointer"
            >
              PS5 HDMI
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('ps5_liquid')}
              className="px-2.5 py-1 text-xs font-mono rounded-full bg-[#C9743F]/15 border border-[#C9743F] text-white hover:bg-[#C9743F] hover:text-black transition cursor-pointer"
            >
              PS5 Flüssigmetall
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('hall_dual')}
              className="px-2.5 py-1 text-xs font-mono rounded-full bg-[#C9743F]/15 border border-[#C9743F] text-white hover:bg-[#C9743F] hover:text-black transition cursor-pointer"
            >
              2x Hall-Effect Sticks
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('autoschluessel')}
              className="px-2.5 py-1 text-xs font-mono rounded-full bg-[#C9743F]/15 border border-[#C9743F] text-white hover:bg-[#C9743F] hover:text-black transition cursor-pointer"
            >
              Autoschlüssel Taster
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('laptop_kurzschluss')}
              className="px-2.5 py-1 text-xs font-mono rounded-full bg-[#C9743F]/15 border border-[#C9743F] text-white hover:bg-[#C9743F] hover:text-black transition cursor-pointer"
            >
              Laptop Kurzschluss
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('datenrettung')}
              className="px-2.5 py-1 text-xs font-mono rounded-full bg-[#C9743F]/15 border border-[#C9743F] text-white hover:bg-[#C9743F] hover:text-black transition cursor-pointer"
            >
              Chip-Datenrettung
            </button>
          </div>
        </div>

        {/* B2B Partner Toggle */}
        <div className="bg-[#00F5D4]/5 border-2 border-dashed border-[#00F5D4] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer font-sans text-xs sm:text-sm font-bold text-white select-none">
            <input
              type="checkbox"
              checked={isB2B}
              onChange={(e) => {
                setIsB2B(e.target.checked);
                if (e.target.checked) setPayMethod('Banküberweisung');
              }}
              className="w-4 h-4 accent-[#00F5D4] cursor-pointer rounded"
            />
            <span className="flex items-center gap-1.5 text-[#00F5D4]">
              <Building2 className="w-4 h-4" /> B2B-Partnerauftrag (Werkstatt / Händler)
            </span>
          </label>

          {isB2B && (
            <div className="flex items-center gap-2 font-mono text-xs text-[#00F5D4]">
              <span>Händlerrabatt:</span>
              <input
                type="number"
                min="0"
                max="60"
                step="5"
                value={b2bDiscount}
                onChange={(e) => setB2bDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-[#040809] border border-[#00F5D4] text-white rounded px-2 py-1 text-center font-bold outline-none"
              />
              <span>%</span>
            </div>
          )}
        </div>

        {/* Customer fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Kunde (Name / Firma):
            </label>
            <input
              type="text"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="z. B. Smartphone-Werkstatt Schmidt"
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Telefon / WhatsApp:
            </label>
            <input
              type="tel"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="0176 ..."
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
            Kundenanschrift (Für offizielle Rechnung &amp; Versicherung):
          </label>
          <input
            type="text"
            value={custAddress}
            onChange={(e) => setCustAddress(e.target.value)}
            placeholder="z. B. Musterstraße 1, 92318 Neumarkt"
            className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
          />
        </div>

        {/* Device & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Gerätemodell &amp; Fehlerbeschreibung:
            </label>
            <input
              type="text"
              value={custDevice}
              onChange={(e) => setCustDevice(e.target.value)}
              placeholder="z. B. Sony PS5 - HDMI Port gebrochen"
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Seriennummer / Kennung:
            </label>
            <input
              type="text"
              value={custSerial}
              onChange={(e) => setCustSerial(e.target.value)}
              placeholder="z. B. S/N oder Box-Nr."
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Labor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Arbeitszeit (Minuten):
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Stundensatz (€ Netto):
            </label>
            <input
              type="number"
              min="30"
              step="5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Parts selection from inventory */}
        <div>
          <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span>Teil aus Lager wählen (bucht bei Speichern automatisch ab):</span>
            </span>
            <span className="text-[10px] text-[#00F5D4]">
              {inventory.length} Artikel vorrätig
            </span>
          </label>
          <select
            value={selectedPartId}
            onChange={(e) => handleSelectPart(e.target.value)}
            className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
          >
            <option value="">— Kein Lagerteil / manuell eingeben —</option>
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} (Bestand: {item.qty} Stk., EK {item.ek.toFixed(2).replace('.', ',')} €)
              </option>
            ))}
          </select>
        </div>

        {/* Part EK and markup */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Ersatzteil EK-Preis (€ Netto):
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={partEK}
              onChange={(e) => setPartEK(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Teile-Aufschlag (% Marge):
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={partMarkup}
              onChange={(e) => setPartMarkup(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Consumables & Overhead */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Verbrauchsmaterial (€ Pauschale):
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={consumables}
              onChange={(e) => setConsumables(Math.max(0, parseFloat(e.target.value) || 0))}
              title="Flussmittel, Silberlot, Entlötlitze, IPA"
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Gemeinkosten-Umlage (€ Fix):
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={overhead}
              onChange={(e) => setOverhead(Math.max(0, parseFloat(e.target.value) || 0))}
              title="Miete, Strom, Werkzeugverschleiß, Mikroskop"
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Warranty risk & Express */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Garantie-Rückstellung (%):
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={warrantyRisk}
              onChange={(e) => setWarrantyRisk(Math.max(0, parseFloat(e.target.value) || 0))}
              title="Puffer für 6 Monate Werkstattgarantie"
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Express-Zuschlag (€ Netto):
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={express}
              onChange={(e) => setExpress(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Tax, Payment, New Device comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Besteuerung:
            </label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            >
              <option value={19}>19 % Regelbesteuerung</option>
              <option value={0}>0 % (§ 19 UStG)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Zahlungsart:
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            >
              <option value="Barzahlung">Barzahlung</option>
              <option value="Banküberweisung">Banküberweisung (14 Tage)</option>
              <option value="PayPal">PayPal</option>
              <option value="EC-Karte">EC-Karte / Kartenzahlung</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
              Vergleich Neukauf (€):
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={newDevicePrice}
              onChange={(e) => setNewDevicePrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onSaveOrder(getPayload(), selectedPartId || undefined);
              handleResetForm();
            }}
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase bg-[#C9743F] text-white hover:bg-[#FF8D4D] shadow-lg shadow-[#C9743F]/25 transition cursor-pointer active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>💾 In Auftragsbuch Buchen</span>
          </button>
          <button
            type="button"
            onClick={() => onPrintInvoice(getPayload())}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer active:scale-[0.99]"
          >
            <Printer className="w-4 h-4" />
            <span>🧾 Rechnung</span>
          </button>
          <button
            type="button"
            onClick={() => onPrintKva(getPayload())}
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs uppercase bg-[#18332E] border border-[#00F5D4]/60 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer active:scale-[0.99]"
          >
            <FileText className="w-4 h-4" />
            <span>📄 KVA</span>
          </button>
        </div>
      </div>

      {/* Right Column: Commercial Evaluation */}
      <div className="lg:col-span-5 bg-[#0B1416] border border-[#C9743F]/30 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/50 space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#00F5D4]">
              KAUFMÄNNISCHE AUSWERTUNG
            </span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                marginPercent >= 55 ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#FF8D4D]/15 text-[#FF8D4D]'
              }`}
            >
              MARGE: {marginPercent.toFixed(1)} %
            </span>
          </div>

          {/* Big Endprice Box */}
          <div className="bg-[#040809] border-[1.5px] border-[#C9743F] rounded-xl p-5 text-center mb-5 shadow-inner">
            <div className="font-mono text-[11px] text-[#859B9E] uppercase tracking-wider">
              {isB2B ? 'Händlerpreis Netto (B2B Partner)' : 'Verbindlicher Endpreis (Kunde)'}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#FF8D4D] my-2 leading-none">
              {isB2B
                ? `${netTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € Netto`
                : `${bruttoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
            </div>
            <div className="font-mono text-xs text-[#859B9E]">
              {isB2B
                ? `zzgl. ${taxRate}% MwSt. (${bruttoTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € Brutto)`
                : taxRate > 0
                ? 'inkl. 19 % gesetzl. MwSt.'
                : 'gemäß § 19 UStG (ohne MwSt.)'}
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-left font-mono text-xs border-collapse">
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-2 text-[#859B9E]">
                  Reine Arbeitszeit ({minutes} Min. à {hourlyRate} €/h):
                </td>
                <td className="py-2 text-right font-bold text-white">
                  {laborNet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[#859B9E]">
                  Ersatzteilpreis (inkl. {partMarkup}% Marge):
                </td>
                <td className="py-2 text-right font-bold text-white">
                  {partVKNet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[#859B9E]">
                  Werkstatt-Verbrauchsmaterial (Flux, Lot, IPA):
                </td>
                <td className="py-2 text-right font-bold text-white">
                  {consumables.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[#859B9E]">
                  Fixkosten- &amp; Maschinenumlage:
                </td>
                <td className="py-2 text-right font-bold text-white">
                  {overhead.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[#859B9E]">
                  Garantie-Puffer (Gewährleistungsrücklage):
                </td>
                <td className="py-2 text-right font-bold text-white">
                  {warrantyValNet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
              {express > 0 && (
                <tr>
                  <td className="py-2 text-[#FF8D4D]">Express-Zuschlag (Vorrang):</td>
                  <td className="py-2 text-right font-bold text-[#FF8D4D]">
                    {express.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                </tr>
              )}
              {isB2B && b2bDiscountVal > 0 && (
                <tr className="text-[#00F5D4]">
                  <td className="py-2">🤝 Händlerrabatt B2B-Partner ({b2bDiscount}%):</td>
                  <td className="py-2 text-right font-bold">
                    -{b2bDiscountVal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                </tr>
              )}
              <tr className="border-t border-[#C9743F]/40 font-bold text-[#00F5D4]">
                <td className="py-2.5">Netto-Rechnungsbetrag:</td>
                <td className="py-2.5 text-right">
                  {netTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
              <tr>
                <td className="py-2 text-[#859B9E]">Umsatzsteuer ({taxRate} %):</td>
                <td className="py-2 text-right font-bold text-white">
                  {taxAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
            </tbody>
          </table>

          {/* Outcome indicators */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center">
              <span className="block text-[11px] font-mono text-[#859B9E]">Reingewinn (Netto DB)</span>
              <strong className="text-base sm:text-lg font-mono text-[#00E676]">
                +{profitNet.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </strong>
            </div>
            <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 text-center">
              <span className="block text-[11px] font-mono text-[#859B9E]">Kundenersparnis</span>
              <strong className="text-base sm:text-lg font-mono text-[#FF8D4D]">
                {customerSavings.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </strong>
            </div>
          </div>
        </div>

        <div className="bg-[#040708] border-l-4 border-[#00F5D4] rounded-lg p-3 text-[11px] text-[#859B9E] font-mono leading-relaxed mt-4">
          🛡️ <strong>Kaufmännischer Grundsatz:</strong> Bei SMD- und Platinenarbeiten den Deckungsbeitrag nicht unter 60 % ansetzen, um Vorhaltezeit, Messgeräte und Diagnoserisiko abzusichern.
        </div>
      </div>
    </div>
  );
};
