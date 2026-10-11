import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Wrench,
  Package,
  Phone,
  MessageSquare,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Cpu,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Filter,
  Check,
  Send,
} from 'lucide-react';
import { Appointment, AppointmentRequiredPart, InventoryItem } from './types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  inventory: InventoryItem[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onConvertToOrder: (appointment: Appointment) => void;
  onOpenSupplierModal: () => void;
  onClearAllAppointments?: () => void;
}

type ViewMode = 'day_dispatch' | 'week_overview' | 'parts_list';

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  inventory,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onConvertToOrder,
  onOpenSupplierModal,
  onClearAllAppointments,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day_dispatch');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form state for creating new appointment
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDevice, setFormDevice] = useState('');
  const [formServiceType, setFormServiceType] = useState('');
  const [formFault, setFormFault] = useState('');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState('14:00');
  const [formDuration, setFormDuration] = useState(45);
  const [formNotes, setFormNotes] = useState('');
  const [formParts, setFormParts] = useState<{ partName: string; inventoryId?: string; qtyNeeded: number }[]>([
    { partName: '', inventoryId: '', qtyNeeded: 1 },
  ]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check stock in inventory
  const getInventoryStock = (part: AppointmentRequiredPart) => {
    if (part.inventoryId) {
      const match = inventory.find((i) => i.id === part.inventoryId);
      if (match) return match;
    }
    const matchByName = inventory.find(
      (i) =>
        i.name.toLowerCase().includes(part.partName.toLowerCase()) ||
        part.partName.toLowerCase().includes(i.name.toLowerCase())
    );
    return matchByName;
  };

  const hasMissingParts = (apt: Appointment) => {
    if (!apt.requiredParts || apt.requiredParts.length === 0) return false;
    return apt.requiredParts.some((p) => {
      const stock = getInventoryStock(p);
      return !stock || stock.qty < p.qtyNeeded;
    });
  };

  // Week calculation (Monday through Saturday)
  const currentWeekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    const days: { dateStr: string; dayName: string; formattedDay: string; isToday: boolean }[] = [];
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const parts = dateStr.split('-');
      days.push({
        dateStr,
        dayName: dayNames[i],
        formattedDay: `${parts[2]}.${parts[1]}`,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [selectedDate, todayStr]);

  const shiftWeek = (deltaDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Appointments for the selected day
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === selectedDate && a.status !== 'storniert')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // Selected appointment object
  const activeAppointment = useMemo(() => {
    if (selectedAppointmentId) {
      const found = appointments.find((a) => a.id === selectedAppointmentId);
      if (found) return found;
    }
    return dayAppointments[0] || appointments[0] || null;
  }, [selectedAppointmentId, appointments, dayAppointments]);

  // Global KPI numbers
  const todayCount = appointments.filter((a) => a.date === todayStr && a.status !== 'storniert').length;
  const missingPartsCount = appointments.filter(
    (a) => hasMissingParts(a) && a.status !== 'erledigt' && a.status !== 'storniert'
  ).length;

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDevice.trim()) return;

    const validParts: AppointmentRequiredPart[] = formParts
      .filter((p) => p.partName.trim().length > 0)
      .map((p) => ({
        partName: p.partName.trim(),
        inventoryId: p.inventoryId || undefined,
        qtyNeeded: Number(p.qtyNeeded) || 1,
      }));

    const newApt: Appointment = {
      id: `TERM-${Math.floor(100 + Math.random() * 900)}`,
      customerName: formName.trim(),
      phone: formPhone.trim() || '0176 0000 000',
      email: formEmail.trim() || undefined,
      device: formDevice.trim(),
      serviceType: formServiceType.trim() || 'Reparatur-Vorprüfung',
      faultDescription: formFault.trim() || 'Reparatur-Annahme & Vorab-Diagnose',
      date: formDate,
      time: formTime,
      estimatedDurationMinutes: Number(formDuration) || 45,
      status: validParts.some((p) => {
        const stock = getInventoryStock(p);
        return !stock || stock.qty < p.qtyNeeded;
      })
        ? 'teile_fehlen'
        : 'bestaetigt',
      requiredParts: validParts,
      internalNotes: formNotes.trim() || undefined,
      createdAt: 'Gerade eben',
    };

    onAddAppointment(newApt);
    setSelectedDate(formDate);
    setSelectedAppointmentId(newApt.id);
    setIsNewModalOpen(false);

    // Reset
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormDevice('');
    setFormServiceType('');
    setFormFault('');
    setFormNotes('');
    setFormParts([{ partName: '', inventoryId: '', qtyNeeded: 1 }]);
  };

  const handleSendWhatsApp = (apt: Appointment) => {
    const cleanPhone = apt.phone.replace(/[^0-9]/g, '');
    let intPhone = cleanPhone;
    if (intPhone.startsWith('0')) intPhone = '49' + intPhone.slice(1);
    const [year, month, day] = apt.date.split('-');
    const dateFormatted = `${day}.${month}.${year}`;

    const text = encodeURIComponent(
      `Hallo ${apt.customerName},\n\ndein Werkstatt-Termin bei der CODE IT-Werkstatt Neumarkt für dein Gerät *${apt.device}* steht für *${dateFormatted}* um *${apt.time} Uhr* fest im Plan.\n\nDie benötigten Bauteile liegen an unserer Werkbank für dich bereit.\n\nAdresse: 92318 Neumarkt i.d.OPf.\nBei Fragen oder Verspätung einfach kurz antworten.\n\nViele Grüße,\nMustafa Al-Zurgany // CODE Werkstatt`
    );
    window.open(`https://wa.me/${intPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Bar: Quiet, high-contrast, structured */}
      <div className="bg-[#080E10] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#00F5D4] uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4 text-[#00F5D4]" />
            <span>
              <span className="hidden sm:inline">// WERKSTATT-TERMINAL • </span>TERMINPLANUNG &amp; VORBEREITUNG
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-400">
            <span>
              Heute: <strong className="text-white">{todayCount} Termine</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Lager-Status:{' '}
              {missingPartsCount > 0 ? (
                <strong className="text-amber-400 font-bold">
                  {missingPartsCount} {missingPartsCount === 1 ? 'Teil fehlt' : 'Teile fehlen'}
                </strong>
              ) : (
                <strong className="text-emerald-400">Alle Teile vorrätig ✓</strong>
              )}
            </span>
          </div>
        </div>

        {/* View Mode Switcher & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Segmented Control */}
          <div className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center bg-[#040809] border border-white/10 p-1 rounded-xl font-mono text-xs">
            <button
              type="button"
              onClick={() => setViewMode('day_dispatch')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === 'day_dispatch'
                  ? 'bg-[#00F5D4] text-[#040809] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="sm:hidden">Tag</span>
              <span className="hidden sm:inline">Tages-Dispatch</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week_overview')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === 'week_overview'
                  ? 'bg-[#00F5D4] text-[#040809] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="sm:hidden">Woche</span>
              <span className="hidden sm:inline">Wochenplan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('parts_list')}
              className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === 'parts_list'
                  ? 'bg-[#00F5D4] text-[#040809] shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span className="sm:hidden">Teile</span>
              <span className="hidden sm:inline">Teile-Bedarf</span>
              {missingPartsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          {/* New Appointment Button */}
          <button
            type="button"
            onClick={() => {
              setFormDate(selectedDate);
              setIsNewModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#C9743F] hover:bg-[#FF8D4D] text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(201,116,63,0.35)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Neuer Termin</span>
          </button>

          {/* Clear all appointments button */}
          {onClearAllAppointments && appointments.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Möchtest du wirklich alle Termine aus dem Kalender und der Cloud löschen?')) {
                  onClearAllAppointments();
                }
              }}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Alle Termine aus dem Kalender löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alle Termine leeren</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Week Strip (Always visible for fast date navigation) */}
      <div className="bg-[#080E10] border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2 shadow-md">
        <div className="flex items-center justify-between sm:justify-start gap-1.5">
          <button
            type="button"
            onClick={() => shiftWeek(-7)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Vorherige Woche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-[#00F5D4]/20 border border-[#00F5D4] text-[#00F5D4]'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300'
            }`}
          >
            Heute
          </button>
          <button
            type="button"
            onClick={() => shiftWeek(7)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Nächste Woche"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* The 6 Day Tiles (Monday to Saturday) */}
        <div className="grid grid-cols-6 gap-1 sm:gap-2 flex-1 max-w-3xl">
          {currentWeekDays.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            const count = appointments.filter((a) => a.date === d.dateStr && a.status !== 'storniert').length;
            const hasMissing = appointments.some(
              (a) => a.date === d.dateStr && hasMissingParts(a) && a.status !== 'erledigt' && a.status !== 'storniert'
            );

            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(d.dateStr);
                  if (viewMode === 'parts_list') setViewMode('day_dispatch');
                }}
                aria-label={`${d.dayName} ${d.formattedDay}: ${count} ${count === 1 ? 'Termin' : 'Termine'}`}
                className={`min-w-0 py-2 px-0.5 sm:px-3 rounded-xl border font-mono text-center transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#00F5D4]/15 border-[#00F5D4] text-white shadow-[0_0_15px_rgba(0,245,212,0.25)]'
                    : d.isToday
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-[#040809] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[11px] font-bold uppercase">{d.dayName}</span>
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">{d.formattedDay}</span>
                </div>
                <div className="text-xs font-black mt-0.5 flex items-center justify-center gap-1">
                  <span className={count > 0 ? (isSelected ? 'text-[#00F5D4]' : 'text-white') : 'text-zinc-600'}>
                    {count}
                    <span className="hidden lg:inline"> {count === 1 ? 'Termin' : 'Termine'}</span>
                  </span>
                  {hasMissing && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Ersatzteil fehlt!" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Views */}

      {/* VIEW 1: DAY DISPATCH (Clean Split View: Timeline on Left, Focus Panel on Right) */}
      {viewMode === 'day_dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (5 Cols): The Day's Schedule List */}
          <div className="lg:col-span-5 bg-[#080E10] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00F5D4]" />
                  <span>Tagesplan • {selectedDate.split('-').reverse().join('.')}</span>
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">
                  {dayAppointments.length} {dayAppointments.length === 1 ? 'Termin eingetragen' : 'Termine eingetragen'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormDate(selectedDate);
                  setIsNewModalOpen(true);
                }}
                className="text-[11px] font-mono text-[#00F5D4] hover:underline font-bold cursor-pointer"
              >
                + Neu
              </button>
            </div>

            {dayAppointments.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-zinc-500 space-y-2">
                <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
                <p>Keine Reparatur-Termine für diesen Tag eingetragen.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFormDate(selectedDate);
                    setIsNewModalOpen(true);
                  }}
                  className="text-xs text-[#00F5D4] font-bold underline cursor-pointer"
                >
                  Jetzt Termin für diesen Tag anlegen
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dayAppointments.map((apt) => {
                  const isSelected = activeAppointment?.id === apt.id;
                  const missing = hasMissingParts(apt);

                  return (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointmentId(apt.id)}
                      className={`p-3.5 rounded-xl border text-left font-mono transition cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#0D181A] border-[#00F5D4] shadow-[0_0_15px_rgba(0,245,212,0.2)]'
                          : 'bg-[#040809] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top row: Time + Status */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#00F5D4] bg-[#00F5D4]/10 px-2 py-0.5 rounded">
                            {apt.time} Uhr
                          </span>
                          <span className="text-[11px] text-zinc-400">~{apt.estimatedDurationMinutes || 45}m</span>
                        </div>
                        {apt.convertedOrderId ? (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            ✓ {apt.convertedOrderId}
                          </span>
                        ) : missing ? (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Teile fehlen
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">✓ Teile bereit</span>
                        )}
                      </div>

                      {/* Device & Customer */}
                      <div className="font-bold text-white text-xs truncate">{apt.device}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center justify-between mt-1">
                        <span>{apt.customerName}</span>
                        <span className="text-[10px] text-zinc-500">{apt.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (7 Cols): Workbench Focus Panel for the selected appointment */}
          <div className="lg:col-span-7 bg-[#080E10] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            {activeAppointment ? (
              <div className="space-y-5">
                {/* Focus Header */}
                <div className="border-b border-white/10 pb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mb-1">
                      <span>Termin-ID: {activeAppointment.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#00F5D4] font-bold">
                        {activeAppointment.time} Uhr • {activeAppointment.date.split('-').reverse().join('.')}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#00F5D4]" />
                      <span>{activeAppointment.device}</span>
                    </h2>
                    {activeAppointment.serviceType && (
                      <span className="text-xs font-mono text-zinc-400">{activeAppointment.serviceType}</span>
                    )}
                  </div>

                  {/* Customer Direct Contact */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeAppointment.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold text-white flex items-center gap-1.5 transition"
                      title="Kunden anrufen"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#00F5D4]" />
                      <span>{activeAppointment.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(activeAppointment)}
                      className="p-2 rounded-xl bg-[#25D366]/20 border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-black transition cursor-pointer"
                      title="WhatsApp Terminbestätigung senden"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section: Was ist zu tun? */}
                <div className="space-y-1.5 font-mono">
                  <span className="text-[11px] text-[#00F5D4] font-bold uppercase tracking-wider block">
                    🔧 Diagnose &amp; Fehlerbild
                  </span>
                  <div className="bg-[#040809] border border-white/10 rounded-xl p-3.5 text-xs text-zinc-200 leading-relaxed font-sans">
                    {activeAppointment.faultDescription}
                  </div>
                </div>

                {/* Section: Ersatzteile & Lagerbestand */}
                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#FF8D4D] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#FF8D4D]" />
                      <span>Benötigte Ersatzteile &amp; Lagerabgleich</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">Live aus WWS-Lager</span>
                  </div>

                  {(!activeAppointment.requiredParts || activeAppointment.requiredParts.length === 0) ? (
                    <div className="bg-[#040809] border border-white/10 rounded-xl p-3 text-xs text-zinc-400 italic">
                      Keine Bauteile hinterlegt (z.B. reine Software-Wartung oder Sichtprüfung).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeAppointment.requiredParts.map((part, pIdx) => {
                        const stockItem = getInventoryStock(part);
                        const isAvailable = stockItem && stockItem.qty >= part.qtyNeeded;
                        const stockQty = stockItem ? stockItem.qty : 0;

                        return (
                          <div
                            key={pIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                              isAvailable
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                                : 'bg-red-500/10 border-red-500/30 text-red-200'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-white">
                                {part.qtyNeeded}x {part.partName}
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                Vorrat im Lager:{' '}
                                <strong className={isAvailable ? 'text-emerald-400' : 'text-red-400'}>
                                  {stockQty} Stk.
                                </strong>
                              </div>
                            </div>

                            {isAvailable ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                                ✓ Reserviert
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={onOpenSupplierModal}
                                className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold text-[11px] hover:bg-red-400 transition cursor-pointer"
                              >
                                Jetzt bestellen &gt;
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Technician Notes */}
                {activeAppointment.internalNotes && (
                  <div className="bg-[#040809] border border-amber-500/20 rounded-xl p-3 text-xs font-mono text-amber-200 flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">💡 Notiz:</span>
                    <span>{activeAppointment.internalNotes}</span>
                  </div>
                )}

                {/* Primary Action Controls */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  {/* Left: 1-Click Order Conversion */}
                  {activeAppointment.convertedOrderId ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Auftrag {activeAppointment.convertedOrderId} aktiv</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConvertToOrder(activeAppointment)}
                      className="px-5 py-2.5 rounded-xl bg-[#00F5D4] hover:bg-white text-[#040809] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,245,212,0.35)] cursor-pointer active:scale-95"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>In Reparaturauftrag umwandeln</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {/* Right: Status selector & Delete */}
                  <div className="flex items-center gap-2 font-mono">
                    <select
                      value={activeAppointment.status}
                      onChange={(e) =>
                        onUpdateAppointment({
                          ...activeAppointment,
                          status: e.target.value as Appointment['status'],
                        })
                      }
                      className="bg-[#040809] border border-white/15 text-zinc-300 text-xs px-2.5 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                    >
                      <option value="bestaetigt">Status: Bestätigt</option>
                      <option value="teile_fehlen">Status: Teile fehlen</option>
                      <option value="in_bearbeitung">Status: In Bearbeitung</option>
                      <option value="erledigt">Status: Erledigt</option>
                      <option value="storniert">Status: Storniert</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Termin für "${activeAppointment.customerName}" wirklich entfernen?`)) {
                          onDeleteAppointment(activeAppointment.id);
                        }
                      }}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Termin löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center font-mono text-xs text-zinc-500">
                Wähle einen Termin auf der linken Seite aus, um Details und Werkstatt-Aktionen anzuzeigen.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK OVERVIEW (Clean 6-Column Dispatch Grid) */}
      {viewMode === 'week_overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {currentWeekDays.map((d) => {
            const dayApts = appointments
              .filter((a) => a.date === d.dateStr && a.status !== 'storniert')
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div
                key={d.dateStr}
                className={`bg-[#080E10] border rounded-2xl p-3 flex flex-col justify-between min-h-[340px] shadow-lg ${
                  d.dateStr === selectedDate
                    ? 'border-[#00F5D4]/40 bg-[#0A1417]'
                    : d.isToday
                    ? 'border-white/20'
                    : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5 font-mono">
                    <span className="font-bold text-xs text-white uppercase">{d.dayName}</span>
                    <span className="text-[11px] text-zinc-400">{d.formattedDay}</span>
                  </div>

                  {dayApts.length === 0 ? (
                    <div className="py-10 text-center font-mono text-[11px] text-zinc-600">Frei</div>
                  ) : (
                    <div className="space-y-2">
                      {dayApts.map((a) => {
                        const missing = hasMissingParts(a);
                        return (
                          <div
                            key={a.id}
                            onClick={() => {
                              setSelectedDate(d.dateStr);
                              setSelectedAppointmentId(a.id);
                              setViewMode('day_dispatch');
                            }}
                            className="bg-[#040809] hover:bg-[#0E1A1C] border border-white/10 hover:border-[#00F5D4]/50 rounded-xl p-2.5 text-left font-mono transition cursor-pointer group"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                              <span className="text-[#00F5D4]">{a.time} Uhr</span>
                              {missing && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Teil fehlt" />
                              )}
                            </div>
                            <div className="text-xs font-bold text-white truncate">{a.device}</div>
                            <div className="text-[10px] text-zinc-400 truncate">{a.customerName}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormDate(d.dateStr);
                    setIsNewModalOpen(true);
                  }}
                  className="w-full mt-3 py-1.5 rounded-lg border border-dashed border-white/10 hover:border-[#00F5D4]/40 text-zinc-500 hover:text-[#00F5D4] text-[11px] font-mono font-bold transition cursor-pointer text-center"
                >
                  + Termin
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: PARTS LIST (Clear Inventory Checklist for all upcoming appointments) */}
      {viewMode === 'parts_list' && (
        <div className="bg-[#080E10] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between font-mono">
            <div>
              <h3 className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#FF8D4D]" />
                <span>Teile-Bedarf &amp; Werkstatt-Vorbereitung</span>
              </h3>
              <span className="text-[11px] text-zinc-400">
                Übersicht aller benötigten Bauteile für anstehende Reparaturen
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenSupplierModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#C9743F] hover:bg-[#FF8D4D] text-white text-xs font-bold transition cursor-pointer"
            >
              Lieferanten-Bestellschein öffnen
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 text-[11px]">
                  <th className="py-2.5 pr-4">Termin / Datum</th>
                  <th className="py-2.5 pr-4">Kunde</th>
                  <th className="py-2.5 pr-4">Gerät</th>
                  <th className="py-2.5 pr-4">Benötigtes Bauteil</th>
                  <th className="py-2.5 pr-4">Lagerbestand</th>
                  <th className="py-2.5 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments
                  .filter((a) => a.status !== 'erledigt' && a.status !== 'storniert')
                  .flatMap((a) =>
                    (a.requiredParts || []).map((p, pIdx) => {
                      const stock = getInventoryStock(p);
                      const isAvailable = stock && stock.qty >= p.qtyNeeded;
                      const stockQty = stock ? stock.qty : 0;

                      return (
                        <tr key={`${a.id}-${pIdx}`} className="hover:bg-white/5">
                          <td className="py-3 pr-4 font-bold text-[#00F5D4]">
                            {a.date.split('-').reverse().join('.')} • {a.time} Uhr
                          </td>
                          <td className="py-3 pr-4 text-white">{a.customerName}</td>
                          <td className="py-3 pr-4 text-zinc-300">{a.device}</td>
                          <td className="py-3 pr-4 text-white font-bold">
                            {p.qtyNeeded}x {p.partName}
                          </td>
                          <td className="py-3 pr-4">
                            {isAvailable ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                ✓ Vorrätig ({stockQty} Stk.)
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold flex items-center gap-1">
                                ⚠️ Nicht vorrätig ({stockQty} Stk.)
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {isAvailable ? (
                              <span className="text-[11px] text-zinc-500">Im Lager reserviert</span>
                            ) : (
                              <button
                                type="button"
                                onClick={onOpenSupplierModal}
                                className="px-2.5 py-1 rounded bg-red-500/20 border border-red-500 text-red-300 font-bold text-[11px] hover:bg-red-500 hover:text-white transition cursor-pointer"
                              >
                                Bestellen
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Neuer Termin eintragen */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0C1518] border border-[#00F5D4]/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 font-mono">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#00F5D4]" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  + Neuer Werkstatt-Termin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-zinc-400 hover:text-white font-mono text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 font-mono">
              {/* Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Kunden-Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="z.B. Max Mustermann"
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Telefon / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0176 1234 567"
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Datum *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Uhrzeit *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Dauer (Min.)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    min={15}
                    step={15}
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
              </div>

              {/* Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Gerät / Modell *</label>
                  <input
                    type="text"
                    required
                    value={formDevice}
                    onChange={(e) => setFormDevice(e.target.value)}
                    placeholder="z.B. PS5 Disc Edition, BMW F30 Schlüssel"
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Reparatur-Art</label>
                  <input
                    type="text"
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    placeholder="z.B. HDMI-Port Tausch, Akkutausch"
                    className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
              </div>

              {/* Fault */}
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase mb-1">
                  Was ist zu tun? (Fehlerbeschreibung) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formFault}
                  onChange={(e) => setFormFault(e.target.value)}
                  placeholder="Genaue Fehlerbeschreibung, Pad-Abrisse, Symptome..."
                  className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              {/* Spare Parts */}
              <div className="bg-[#050A0B] border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#00F5D4] font-bold uppercase flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>Benötigte Ersatzteile</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormParts([...formParts, { partName: '', inventoryId: '', qtyNeeded: 1 }])
                    }
                    className="text-[10px] text-[#00F5D4] hover:underline font-bold cursor-pointer"
                  >
                    + Weiteres Teil
                  </button>
                </div>

                {formParts.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.partName}
                      onChange={(e) => {
                        const copy = [...formParts];
                        copy[idx].partName = e.target.value;
                        setFormParts(copy);
                      }}
                      placeholder="Bauteilname..."
                      className="flex-1 bg-[#091113] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                    />
                    <select
                      value={p.inventoryId || ''}
                      onChange={(e) => {
                        const copy = [...formParts];
                        copy[idx].inventoryId = e.target.value;
                        const matched = inventory.find((i) => i.id === e.target.value);
                        if (matched && !copy[idx].partName) {
                          copy[idx].partName = matched.name;
                        }
                        setFormParts(copy);
                      }}
                      className="bg-[#091113] border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-zinc-300 focus:outline-none"
                    >
                      <option value="">-- Lager verknüpfen --</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.qty} Stk.)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={p.qtyNeeded}
                      onChange={(e) => {
                        const copy = [...formParts];
                        copy[idx].qtyNeeded = Number(e.target.value) || 1;
                        setFormParts(copy);
                      }}
                      className="w-14 bg-[#091113] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none"
                    />
                    {formParts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormParts(formParts.filter((_, i) => i !== idx))}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase mb-1">Interne Notiz</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="z.B. Express-Termin, Kunde wartet vor Ort..."
                  className="w-full bg-[#050A0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00F5D4] text-[#040809] font-black uppercase text-xs hover:bg-white transition cursor-pointer"
                >
                  Termin anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
