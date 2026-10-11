import React, { useState } from 'react';
import {
  X,
  Shield,
  UserPlus,
  Users,
  Building,
  KeyRound,
  Trash2,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { User, WorkshopSettings } from './types';
import { MIN_PIN_LENGTH } from './pinAuth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>, pin: string) => Promise<void>;
  onUpdateUserPin: (userId: string, newPin: string) => Promise<void>;
  onToggleUserActive: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  workshopSettings: WorkshopSettings;
  onSaveWorkshopSettings: (settings: WorkshopSettings) => void;
  onClearAllAppointments?: () => void;
  onClearAllInventory?: () => void;
  onClearAllOrders?: () => void;
}

// Löschen auf allen Geräten: nur nach getippter Bestätigung, nicht mit einem Klick
function confirmDangerous(what: string): boolean {
  const answer = prompt(`Damit werden ${what} auf allen Geräten gelöscht.\nZum Bestätigen LÖSCHEN eingeben:`);
  return answer?.trim().toUpperCase() === 'LÖSCHEN';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onAddUser,
  onUpdateUserPin,
  onToggleUserActive,
  onDeleteUser,
  workshopSettings,
  onSaveWorkshopSettings,
  onClearAllAppointments,
  onClearAllInventory,
  onClearAllOrders,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'profile' | 'database'>('users');

  // New user form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'techniker' | 'buchhaltung'>('techniker');
  const [pin, setPin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Edit PIN state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPinInput, setNewPinInput] = useState('');

  // Workshop Profile form state
  const [wName, setWName] = useState(workshopSettings.workshopName);
  const [wOwner, setWOwner] = useState(workshopSettings.ownerName);
  const [wAddress, setWAddress] = useState(workshopSettings.address);
  const [wPhone, setWPhone] = useState(workshopSettings.phone);
  const [wEmail, setWEmail] = useState(workshopSettings.email);
  const [wRate, setWRate] = useState(workshopSettings.defaultHourlyRate);
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pin.trim().length < MIN_PIN_LENGTH) {
      alert(`Bitte Namen und eine PIN mit mindestens ${MIN_PIN_LENGTH} Zeichen eingeben.`);
      return;
    }
    const cleanUsername = username.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      alert('Diesen Benutzernamen gibt es schon.');
      return;
    }
    await onAddUser(
      {
        name: name.trim(),
        username: cleanUsername,
        role,
        active: true,
        canSettleInvoices: role === 'admin' || role === 'buchhaltung',
        canDelete: role === 'admin',
      },
      pin.trim()
    );
    setName('');
    setUsername('');
    setPin('');
    setRole('techniker');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSavePin = async (userId: string) => {
    if (newPinInput.trim().length < MIN_PIN_LENGTH) {
      alert(`Die neue PIN braucht mindestens ${MIN_PIN_LENGTH} Zeichen.`);
      return;
    }
    await onUpdateUserPin(userId, newPinInput.trim());
    setEditingUserId(null);
    setNewPinInput('');
    alert('Kennwort/PIN wurde erfolgreich aktualisiert.');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#0B1416] border-[1.5px] border-[#00F5D4] rounded-2xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#00F5D4] p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
          <div>
            <h3 className="font-mono text-lg sm:text-xl font-black text-[#00F5D4] tracking-wide flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FF8D4D]" />
              <span>SYSTEM-EINSTELLUNGEN &amp; MITARBEITER-KONTEN</span>
            </h3>
            <p className="text-xs text-[#859B9E] font-mono mt-0.5">
              Angemeldet als: <strong className="text-white">{currentUser?.name}</strong>{' '}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                  isAdmin
                    ? 'bg-[#C9743F]/20 text-[#FF8D4D] border border-[#C9743F]/40'
                    : 'bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40'
                }`}
              >
                {currentUser?.role}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#040809] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              👥 Benutzer ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🏢 Werkstatt-Profil
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('database')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'database'
                    ? 'bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ☁️ Cloud &amp; Daten
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {isAdmin ? (
              <div className="bg-[#040809] border border-[#C9743F]/30 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3.5">
                  <h4 className="font-mono text-xs sm:text-sm font-bold text-[#FF8D4D] flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#00F5D4]" />
                    <span>Neuen Mitarbeiter / Benutzer anlegen</span>
                  </h4>
                  {showSuccess && (
                    <span className="text-xs font-mono text-[#00E676] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Konto erfolgreich erstellt!</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                        Mitarbeiter-Name:
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="z. B. Alex Schmidt"
                        className="w-full bg-[#0B1416] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                        Benutzername (Login):
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="z. B. alex"
                        className="w-full bg-[#0B1416] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                        Rolle &amp; Berechtigung:
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full bg-[#0B1416] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                      >
                        <option value="techniker">Techniker (Reparaturen &amp; Lager)</option>
                        <option value="buchhaltung">Buchhaltung (Rechnung &amp; Kasse)</option>
                        <option value="admin">Administrator / Inhaber (Vollzugriff)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                        Sicherer PIN / Passwort:
                      </label>
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="z. B. 4819 oder Kennwort"
                        className="w-full bg-[#0B1416] border border-[#00F5D4]/60 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono font-bold text-xs uppercase bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition cursor-pointer shadow-md"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Mitarbeiter-Konto aktivieren</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#050E10] border-l-4 border-[#FFD600] rounded-xl p-4 text-xs font-mono text-gray-300">
                ⚠️ Du bist als <strong>Techniker</strong> angemeldet. Nur Administratoren können neue Mitarbeiterkonten erstellen. Unten kannst du jedoch dein eigenes Kennwort anpassen.
              </div>
            )}

            {/* Users List */}
            <div>
              <h4 className="font-mono text-xs sm:text-sm font-bold text-[#00F5D4] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F5D4]" />
                <span>Registrierte Benutzer &amp; Mitarbeiter ({users.length})</span>
              </h4>
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left font-mono text-xs border-collapse min-w-[650px]">
                  <thead className="bg-[#050A0C] text-[#00F5D4] border-b border-white/10">
                    <tr>
                      <th className="p-3">Mitarbeiter</th>
                      <th className="p-3">Benutzername</th>
                      <th className="p-3">Rolle</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Erstellt am</th>
                      <th className="p-3 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => {
                      const isMe = u.id === currentUser?.id;
                      const canEditThisUser = isAdmin || isMe;
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                                u.role === 'admin'
                                  ? 'bg-[#C9743F]/25 text-[#FF8D4D]'
                                  : 'bg-[#00F5D4]/20 text-[#00F5D4]'
                              }`}
                            >
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span>{u.name}</span>
                              {isMe && (
                                <span className="ml-1.5 text-[10px] text-[#00F5D4] font-normal">
                                  (Du)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-gray-300">@{u.username}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-[#C9743F]/20 text-[#FF8D4D] border border-[#C9743F]/40'
                                  : u.role === 'buchhaltung'
                                  ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                                  : 'bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30'
                              }`}
                            >
                              {u.role === 'admin' ? 'Admin' : u.role === 'buchhaltung' ? 'Buchhaltung' : 'Techniker'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                                u.active === false ? 'bg-[#FF5252]' : 'bg-[#00E676]'
                              }`}
                            />
                            <span className={u.active === false ? 'text-[#FF5252]' : 'text-[#00E676]'}>
                              {u.active === false ? 'Gesperrt' : 'Aktiv'}
                            </span>
                          </td>
                          <td className="p-3 text-[#859B9E]">{u.createdAt}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {canEditThisUser && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(editingUserId === u.id ? null : u.id);
                                    setNewPinInput('');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-200 hover:border-[#00F5D4] hover:text-[#00F5D4] transition cursor-pointer"
                                  title="Kennwort/PIN ändern"
                                >
                                  <KeyRound className="w-3 h-3" />
                                  <span>PIN ändern</span>
                                </button>
                              )}

                              {isAdmin && !isMe && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onToggleUserActive(u.id)}
                                    className="px-2 py-1 rounded text-[11px] font-mono text-gray-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                                  >
                                    {u.active === false ? 'Aktivieren' : 'Sperren'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteUser(u.id)}
                                    className="p-1 text-gray-500 hover:text-[#FF5252] transition cursor-pointer"
                                    title="Konto löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* In-place PIN Editor */}
              {editingUserId && (
                <div className="mt-3.5 bg-[#050A0B] border border-[#00F5D4] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#00F5D4]" />
                    <span className="text-xs font-mono text-white">
                      Neues Kennwort/PIN für{' '}
                      <strong>{users.find((u) => u.id === editingUserId)?.name}</strong>:
                    </span>
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="Neuer PIN / Passwort"
                      className="bg-[#0B1416] border border-[#00F5D4]/60 text-white rounded px-2.5 py-1 text-xs font-mono outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSavePin(editingUserId)}
                      className="px-3 py-1 rounded bg-[#00F5D4] text-black font-mono font-bold text-xs cursor-pointer hover:bg-[#00F5D4]/90"
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="px-2 py-1 text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Workshop Profile */}
        {activeTab === 'profile' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveWorkshopSettings({
                workshopName: wName,
                ownerName: wOwner,
                address: wAddress,
                phone: wPhone,
                email: wEmail,
                website: workshopSettings.website,
                defaultHourlyRate: Number(wRate) || 85,
              });
              setProfileSaved(true);
              setTimeout(() => setProfileSaved(false), 3000);
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <h4 className="font-mono text-xs sm:text-sm font-bold text-[#FF8D4D] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#00F5D4]" />
                <span>Werkstatt-Stammdaten &amp; Rechnungsanschrift</span>
              </h4>
              {profileSaved && (
                <span className="text-xs font-mono text-[#00E676] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Stammdaten gespeichert!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                  Werkstattname:
                </label>
                <input
                  type="text"
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                  Inhaber (Rechtsträger):
                </label>
                <input
                  type="text"
                  value={wOwner}
                  onChange={(e) => setWOwner(e.target.value)}
                  className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                  Anschrift / Standort:
                </label>
                <input
                  type="text"
                  value={wAddress}
                  onChange={(e) => setWAddress(e.target.value)}
                  className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                  Telefon / WhatsApp:
                </label>
                <input
                  type="text"
                  value={wPhone}
                  onChange={(e) => setWPhone(e.target.value)}
                  className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                  E-Mail:
                </label>
                <input
                  type="email"
                  value={wEmail}
                  onChange={(e) => setWEmail(e.target.value)}
                  className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#859B9E] uppercase mb-1">
                  Standard-Stundensatz (€ Netto):
                </label>
                <input
                  type="number"
                  min="30"
                  step="5"
                  value={wRate}
                  onChange={(e) => setWRate(Number(e.target.value) || 85)}
                  className="w-full bg-[#040809] border border-[#C9743F]/40 text-white rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00F5D4] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono font-bold text-xs uppercase bg-[#C9743F] text-white hover:bg-[#FF8D4D] transition cursor-pointer shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Stammdaten sichern</span>
            </button>
          </form>
        )}

        {/* Tab 3: Cloud Database & Demo Data */}
        {activeTab === 'database' && isAdmin && (
          <div className="space-y-5">
            <div className="bg-[#040809] border border-[#00F5D4]/30 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] animate-pulse" />
                  <h4 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Cloudflare D1 SQL-Datenbank
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[#00F5D4] bg-[#00F5D4]/10 px-2 py-0.5 rounded border border-[#00F5D4]/30">
                  Aktiv &amp; Verbunden
                </span>
              </div>

              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Aufträge, Lager, Termine, Mitarbeiter-Konten und Stammdaten werden mit deinem Cloudflare Worker synchronisiert und sind auf jedem Werkstatt-Gerät gleich. Löschen gilt für alle Geräte und lässt sich nicht rückgängig machen. Sichere vorher ein JSON-Backup unter „Export &amp; Tools“.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Clear Appointments */}
                <div className="p-3.5 rounded-xl bg-[#080E10] border border-white/10 space-y-2">
                  <div className="font-mono text-xs font-bold text-white flex items-center justify-between">
                    <span>📅 Termine</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Löscht alle Termine aus dem Kalender und der Cloudflare-Datenbank.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDangerous('alle Termine')) {
                        onClearAllAppointments?.();
                        alert('Alle Termine wurden erfolgreich geleert.');
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Termine leeren</span>
                  </button>
                </div>

                {/* Clear Inventory */}
                <div className="p-3.5 rounded-xl bg-[#080E10] border border-white/10 space-y-2">
                  <div className="font-mono text-xs font-bold text-white flex items-center justify-between">
                    <span>📦 Lagerbestand</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Löscht alle Ersatzteile aus dem Lager und der Cloudflare-Datenbank.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDangerous('alle Lagerteile')) {
                        onClearAllInventory?.();
                        alert('Lagerbestand wurde erfolgreich geleert.');
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Lager leeren</span>
                  </button>
                </div>

                {/* Clear Orders */}
                <div className="p-3.5 rounded-xl bg-[#080E10] border border-white/10 space-y-2">
                  <div className="font-mono text-xs font-bold text-white flex items-center justify-between">
                    <span>📋 Aufträge</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Löscht alle Aufträge aus der Liste und der Cloudflare-Datenbank.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDangerous('alle Aufträge')) {
                        onClearAllOrders?.();
                        alert('Aufträge wurden erfolgreich geleert.');
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Aufträge leeren</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
