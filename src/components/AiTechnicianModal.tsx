import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, RotateCcw, Image as ImageIcon, Sparkles, Calendar, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';
import { ChatMessage, DeviceCategoryKey } from '../types';
import { requestAiDiagnosis, validateAndFormatResponse } from '../services/aiTechnicianService';

interface AiTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckIn?: (preset?: { device?: string; fault?: string }) => void;
  initialQuery?: string;
  defaultCategory?: DeviceCategoryKey;
}

export const AiTechnicianModal: React.FC<AiTechnicianModalProps> = ({
  isOpen,
  onClose,
  onOpenCheckIn,
  initialQuery,
  defaultCategory = 'laptop_pc',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hallo! Ich bin der **KI-Techniker** der CODE IT-Werkstatt in Neumarkt i.d.OPf. 🔬\n\nBeschreibe mir dein Problem in eigenen Worten (z. B. *»PS5 schaltet nach 2 Sekunden mit blauem Licht ab«*, *»MacBook lädt nicht über USB-C«* oder *»DualSense zieht nach links«*).\n\n📸 **Neu:** Du kannst unten auch direkt ein Foto deines beschädigten Geräts, Ports oder Mainboards hochladen – ich analysiere die Bauteile mit tiefer Schaltplan-Logik für dich!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DeviceCategoryKey>(defaultCategory);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine gültige Bilddatei aus (JPEG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        preview: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend || 'Bitte analysiere dieses Bauteilfoto.',
      imagePreview: selectedImage?.preview,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentImage = selectedImage;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Build conversation history (excluding the welcome prompt)
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const result = await requestAiDiagnosis({
        message: textToSend,
        history,
        deviceCategory: activeCategory,
        image: currentImage ? { data: currentImage.data, mimeType: currentImage.mimeType } : undefined,
      });

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const offlineReply = getOfflineDiagnosticReply(textToSend, activeCategory);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: validateAndFormatResponse(offlineReply, activeCategory),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOfflineDiagnosticReply = (query: string, cat: DeviceCategoryKey) => {
    const q = query.toLowerCase();
    if (q.includes('hdmi') || cat === 'konsole') {
      return `1. **Kurz & verständlich (Der Hauptgrund):**
Die mechanischen Federpins der HDMI-Buchse sind abgeschert oder die ESD-Schutzfilterdioden vor dem Video-Transceiver sind durch statische Überspannung durchlegiert.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Bei der PlayStation 5 führt ein abgerissener Pin 18 (+5V Power) oder Pin 19 (Hot Plug Detect) zu fehlendem Handshake. Oft ist zusätzlich der Panasonic MN864729 bzw. TDP158 Video Retimer IC beschädigt oder eine der EMI-Filterdrosseln unterbrochen.

3. **Lösung & Kosten (Neumarkt):**
Wir prüfen die Datenleitungen (D0-D2, CLK) per Diodenmessung gegen Masse unter dem 40x Stereomikroskop und löten einen OEM-HDMI-Port mit bleifreiem Silberlot spannungsfrei ein. Der Richtpreis liegt ab 89 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.
Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung.`;
    }
    if (q.includes('wasser') || q.includes('flüssig') || q.includes('kaffee')) {
      return `1. **Kurz & verständlich (Der Hauptgrund):**
Flüssigkeitseintritt hat zu elektrolytischer Korrosion und einem harten Kurzschluss auf der primären 19V / 12V Hauptstromschiene geführt.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Die Flüssigkeit erzeugt Kriechströme zwischen VDD_MAIN bzw. PPBUS_G3H und Masse. Dabei legieren meist niederohmige 0603-Glättungskondensatoren durch oder die Lötkugeln unter den BGA/QFN-Power-Management-ICs (z. B. ISL-Serie oder CD3215) oxidieren.

3. **Lösung & Kosten (Neumarkt):**
Wir entfernen die Korrosion im Ultraschall-Reinigungsbad und lokalisieren den genauen Kurzschluss mittels Labornetzteil und FLIR-Wärmebildkamera. Der Richtpreis liegt ab 99 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.
Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung.`;
    }
    if (q.includes('drift') || cat === 'controller') {
      return `1. **Kurz & verständlich (Der Hauptgrund):**
Die resistive Graphit-Leiterbahn des ab Werk verbauten Schleifkontakt-Potentiometers ist mechanisch abgerieben.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Klassische Potentiometer verschleißen durch mechanische Reibung, was zu schwankenden Referenzspannungen (0V bis 3.3V) an den ADC-Eingängen des Mikrocontrollers führt. Die Lösung ist der Umbau auf berührungslose magnetische Hall-Effect-Sensoren (K-Silver / FavocTech), die verschleißfrei über das Magnetfeld arbeiten.

3. **Lösung & Kosten (Neumarkt):**
Wir entlöten die alten Module auf der Lötstation, setzen Hall-Effect-Joysticks ein und kalibrieren den Nullpunkt mikrometergenau mit unserem Hardware-Prüfstand auf unter 0,03% Abweichung. Der Richtpreis liegt ab 40 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.
Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung.`;
    }
    return `1. **Kurz & verständlich (Der Hauptgrund):**
Auf der Hauptplatine liegt ein bauteilbedingter Fehler im Spannungsregler- oder Signalpfad vor, der die Initialisierung verhindert.

2. **Technischer Hintergrund (Chiplevel-Beweis):**
Wir analysieren die Power-Sequence des Logic-Boards: Häufig bricht eine der Hilfsspannungen (3.3V Always-On, 1.8V Logic oder 1.05V SoC) durch einen defekten LDO oder MOSFET zusammen, wodurch das System im Schutzmodus (OCP / UVLO) verharrt.

3. **Lösung & Kosten (Neumarkt):**
Wir prüfen die Platine im Labor mit Oszilloskop und Diodenmessung gegen Masse, um das defekte SMD-Bauteil gezielt auszutauschen. Der Richtpreis liegt ab 79 €. Du erhältst 6 Monate Werkstattgarantie, Abgabe in Neumarkt i.d.OPf. oder deutschlandweiter Paketversand ist möglich.
Du kannst dein Gerät direkt an unserer Werkbank abgeben – reserviere dir dafür einfach unten deinen 1-stündigen Werkbank-Termin zur Annahme & Erstprüfung.`;
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Diagnose zurückgesetzt. Womit kann dir unser Labor in Neumarkt helfen?\n\nDu kannst auch ein Foto des defekten Bauteils hochladen.`,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#091214] border border-[#00F5D4]/40 w-full max-w-2xl h-[88vh] max-h-[760px] rounded-2xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#050A0C] border-b border-white/10 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white tracking-wide">
                  CODE // KI-TECHNIKER
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
                  HIGH THINKING AKTIV
                </span>
              </div>
              <p className="text-[11px] text-[#839897] font-mono">
                Gemini 3.1 Pro • Bauteildiagnose &amp; Schaltplan-Analytik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Diagnose neu starten"
              className="p-1.5 rounded-lg text-[#839897] hover:text-[#00F5D4] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#839897] hover:text-[#C9743F] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-[#C9743F]/10 border-b border-[#C9743F]/25 px-4 py-1.5 text-[11px] text-[#FF8D4D] font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Unverbindliche Ersteinschätzung • Verbindlicher Festpreis nach Begutachtung unter dem Mikroskop in Neumarkt.</span>
        </div>

        {/* Category Pills inside Chat */}
        <div className="bg-[#070F11] border-b border-white/5 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-mono shrink-0">
          <span className="text-[#839897] text-[10px] uppercase mr-1">Gerät:</span>
          {(['laptop_pc', 'konsole', 'controller', 'schluessel', 'phone', 'daten'] as DeviceCategoryKey[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all text-[11px] cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#00F5D4] text-[#060B0C] font-bold shadow-[0_0_8px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-[#839897] hover:text-white'
              }`}
            >
              {cat === 'laptop_pc' && '💻 Laptop/PC'}
              {cat === 'konsole' && '🎮 Konsole'}
              {cat === 'controller' && '🕹️ Controller'}
              {cat === 'schluessel' && '🔑 Schlüssel'}
              {cat === 'phone' && '📱 Smartphone'}
              {cat === 'daten' && '💾 Datenrettung'}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#C9743F] to-[#FF8D4D] text-white rounded-br-xs shadow-md'
                    : 'bg-[#101D20] border border-[#00F5D4]/25 text-[#F3F7F7] rounded-bl-xs shadow-lg'
                }`}
              >
                {/* Image preview in chat */}
                {msg.imagePreview && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-h-48">
                    <img src={msg.imagePreview} alt="Hochgeladenes Bauteilfoto" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Formatted Text */}
                <div
                  className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1 py-0.5 rounded text-[#00F5D4]">$1</code>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {/* Direct Action HUD attached to Bot replies */}
                {msg.role === 'model' && msg.id !== 'welcome' && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2 text-xs font-mono">
                    <a
                      href={`https://wa.me/4917641744443?text=${encodeURIComponent(
                        'Hallo Mustafa, ich habe mit deinem KI-Techniker auf code-ger.de gesprochen:\n\n' +
                          msg.text.substring(0, 180) +
                          '...\n\nWann kann ich mein Gerät zur Reparatur in Neumarkt übergeben?'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366] hover:text-[#040809] transition-all font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp an Mustafa</span>
                    </a>
                    <button
                      type="button"
                      data-cal-link="mustafa-al-zurgany-cfwhg8/code-werkstatt"
                      data-cal-config='{"layout":"month_view","theme":"dark"}'
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-[#060B0C] transition-all font-bold cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Termin an Werkbank</span>
                    </button>
                    {onOpenCheckIn && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCheckIn({
                            device: activeCategory,
                            fault: msg.text.substring(0, 120),
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 text-[#839897] hover:text-white transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[#C9743F]" />
                        <span>Digitaler Check-In</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {msg.timestamp && (
                <span className="text-[10px] font-mono text-[#839897] mt-1 px-1">
                  {msg.timestamp}
                </span>
              )}
            </div>
          ))}

          {/* Thinking & Analyzing Animation */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="bg-[#101D20] border border-[#00F5D4]/40 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#00F5D4] animate-spin" />
                <div className="font-mono text-xs text-[#00F5D4]">
                  Gemini 3.1 Pro High Thinking aktiv: Schaltszenarien &amp; Stromschienen werden analysiert...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-[#050A0C] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-mono text-[#839897] uppercase shrink-0">Vorschläge:</span>
          <button
            type="button"
            onClick={() => handleSend('PS5 HDMI-Port gebrochen, zeigt kein Bild mehr am 4K Fernseher')}
            className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-[#839897] hover:border-[#00F5D4] hover:text-[#00F5D4] whitespace-nowrap transition-colors cursor-pointer"
          >
            🎮 PS5 HDMI gebrochen
          </button>
          <button
            type="button"
            onClick={() => handleSend('Laptop Wasserschaden: Kaffee über Tastatur gelaufen, schaltet nicht mehr ein')}
            className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-[#839897] hover:border-[#00F5D4] hover:text-[#00F5D4] whitespace-nowrap transition-colors cursor-pointer"
          >
            ☕ Laptop Wasserschaden
          </button>
          <button
            type="button"
            onClick={() => handleSend('PS5 Controller hat extremen Stick-Drift auf beiden Sticks. Hall-Effect Umbau möglich?')}
            className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-[#839897] hover:border-[#00F5D4] hover:text-[#00F5D4] whitespace-nowrap transition-colors cursor-pointer"
          >
            🕹️ DualSense Hall-Effect
          </button>
          <button
            type="button"
            onClick={() => handleSend('BMW Autoschlüssel lädt nicht mehr im Schacht und Taste wackelt')}
            className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-[#839897] hover:border-[#00F5D4] hover:text-[#00F5D4] whitespace-nowrap transition-colors cursor-pointer"
          >
            🔑 Autoschlüssel Akku
          </button>
        </div>

        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-[#060D0E] border-t border-[#00F5D4]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={selectedImage.preview} alt="Vorschau" className="w-10 h-10 object-cover rounded border border-[#00F5D4]/50" />
              <div className="text-xs font-mono text-[#00F5D4]">
                Foto angehängt (wird zur Bauteil-Erkennung übermittelt)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="text-[#839897] hover:text-red-400 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-[#050A0C] border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Foto vom Bauteil / Schaden anhängen"
            className="p-2.5 rounded-xl border border-white/10 text-[#839897] hover:text-[#00F5D4] hover:border-[#00F5D4]/40 hover:bg-[#00F5D4]/10 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Fehler beschreiben oder Frage stellen..."
            disabled={isLoading}
            className="flex-1 bg-[#0E1A1C] border border-[#C9743F]/30 focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#839897] outline-none font-mono"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-2.5 rounded-xl bg-[#C9743F] hover:bg-[#FF8D4D] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(201,116,63,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
