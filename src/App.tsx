import React, { useState, useEffect } from 'react';
import { DeviceCategoryKey } from './types';
import { CircuitCanvas } from './components/CircuitCanvas';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiagnoseCalculator } from './components/DiagnoseCalculator';
import { ServiceMatrix } from './components/ServiceMatrix';
import { B2BSection } from './components/B2BSection';
import { StatusTracker } from './components/StatusTracker';
import { WorkflowSection } from './components/WorkflowSection';
import { ReviewsSection } from './components/ReviewsSection';
import { PhilosophySection } from './components/PhilosophySection';
import { AppointmentSection } from './components/AppointmentSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AiTechnicianModal } from './components/AiTechnicianModal';
import { CheckInModal } from './components/CheckInModal';
import { LegalModals } from './components/LegalModals';
import { MobileBottomBar } from './components/MobileBottomBar';
import { SecretTerminalModal } from './components/SecretTerminalModal';
import { WerkstattManagerApp } from './manager/WerkstattManagerApp';

export default function App() {
  const [viewMode, setViewMode] = useState<'website' | 'manager'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('manager') || search.includes('manager=1') || search.includes('view=manager')) {
        return 'manager';
      }
    }
    return 'website';
  });
  const [currentCategory, setCurrentCategory] = useState<DeviceCategoryKey>('laptop_pc');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInPreset, setCheckInPreset] = useState<{ device?: string; fault?: string } | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'impressum' | 'datenschutz' | null>(null);
  const [isSecretTerminalOpen, setIsSecretTerminalOpen] = useState(false);

  // Keyboard shortcut for secret workshop manager access: Ctrl + Shift + L or Alt + W
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') || (e.altKey && e.key.toLowerCase() === 'w')) {
        e.preventDefault();
        setIsSecretTerminalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsAiChatOpen(false);
        setIsCheckInOpen(false);
        setLegalModalType(null);
        setIsSecretTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAiChat = (initialQuery?: string) => {
    setAiInitialQuery(initialQuery);
    setIsAiChatOpen(true);
  };

  const handleSelectCategory = (cat: DeviceCategoryKey) => {
    setCurrentCategory(cat);
    const diagEl = document.getElementById('diagnose');
    if (diagEl) {
      diagEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCheckInWithPreset = (preset?: { device?: string; fault?: string }) => {
    setCheckInPreset(preset);
    setIsCheckInOpen(true);
  };

  const handleScrollToStatus = () => {
    const el = document.getElementById('status');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If Manager view is active (triggered by 5x clicking logo)
  if (viewMode === 'manager') {
    return (
      <WerkstattManagerApp
        onBackToWebsite={() => setViewMode('website')}
      />
    );
  }

  // Public customer website view
  return (
    <div className="relative min-h-screen bg-[#060B0C] text-[#F3F7F7] selection:bg-[#4FA39B]/30 selection:text-[#00F5D4] pb-28 md:pb-0 overflow-x-hidden w-full max-w-full">
      {/* Background Circuit Particle Grid */}
      <CircuitCanvas />

      {/* Main Foreground Container */}
      <div className="relative z-10 flex flex-col">
        {/* Navigation HUD */}
        <Header
          onOpenSecretModal={() => setIsSecretTerminalOpen(true)}
          onOpenAiChat={() => handleOpenAiChat()}
          onOpenStatusTracker={handleScrollToStatus}
        />

        {/* Hero Section */}
        <Hero
          onSelectCategory={handleSelectCategory}
          onOpenAiChat={handleOpenAiChat}
        />

        {/* Interactive Diagnosis & Cost Estimator */}
        <DiagnoseCalculator
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          onOpenAiChat={handleOpenAiChat}
        />

        {/* Live Repair Status Tracker with QR Scanner & Shared Orders */}
        <StatusTracker />

        {/* Detailed Services Matrix */}
        <ServiceMatrix />

        {/* B2B Partner Portal */}
        <B2BSection />

        {/* 4-Step Process Workflow */}
        <WorkflowSection />

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Sustainability & Repair Philosophy */}
        <PhilosophySection />

        {/* FAQ & Micro-Soldering Knowledge */}
        <FaqSection />

        {/* Cal.com Workbench Appointment Booking */}
        <AppointmentSection />

        {/* Contact & Mail-In Shipping */}
        <ContactSection />

        {/* Footer with 5-click secret manager trigger on bottom-left logo */}
        <Footer
          onOpenCheckIn={() => setIsCheckInOpen(true)}
          onOpenLegal={(type) => setLegalModalType(type)}
          onOpenSecretModal={() => setIsSecretTerminalOpen(true)}
        />
      </div>

      {/* Sticky Mobile Bar & Floating Desktop AI Trigger */}
      <MobileBottomBar onOpenAiChat={() => handleOpenAiChat()} />

      {/* AI Technician Chat Modal (Gemini 3.1 Pro High Thinking) */}
      <AiTechnicianModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        initialQuery={aiInitialQuery}
        defaultCategory={currentCategory}
        onOpenCheckIn={handleOpenCheckInWithPreset}
      />

      {/* Digital Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        presetData={checkInPreset}
      />

      {/* Secret Terminal PIN Modal (Access code 2026) */}
      <SecretTerminalModal
        isOpen={isSecretTerminalOpen}
        onClose={() => setIsSecretTerminalOpen(false)}
        onUnlockSuccess={() => {
          setIsSecretTerminalOpen(false);
          setViewMode('manager');
        }}
      />

      {/* Legal Imprint & GDPR Data Privacy Modals */}
      <LegalModals
        modalType={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
