import React, { useState, useEffect } from 'react';
import { Download, X, Share, SquarePlus } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDevice);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
        App aktiv
      </span>
    );
  }

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-[#C9743F] to-[#FF8D4D] text-white hover:brightness-110 shadow-lg shadow-[#C9743F]/25 transition-all cursor-pointer animate-pulse"
        title="CODE WWS als eigenständige Desktop- oder Smartphone-App installieren"
      >
        <Download className="w-3.5 h-3.5" />
        <span>App installieren</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-[#00F5D4] bg-[#00F5D4]/10 text-[#00F5D4] hover:bg-[#00F5D4] hover:text-black transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Auf iOS installieren</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl bg-[#0B1416] border border-[#00F5D4] p-6 shadow-2xl relative text-left">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#10191A] border border-[#C9743F] flex items-center justify-center font-mono font-black text-[#00F5D4]">
                  &lt;/&gt;
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    CODE WWS auf iPhone installieren
                  </h3>
                  <p className="text-xs text-[#859B9E]">Als Vollbild-App ohne Browser-Leiste</p>
                </div>
              </div>

              <ol className="text-xs text-gray-200 space-y-3 font-sans border-t border-gray-800 pt-3">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#00F5D4]">1.</span>
                  <span>
                    Tippe unten in der Safari-Symbolleiste auf das <strong>Teilen-Symbol</strong>{' '}
                    <Share className="inline w-3.5 h-3.5 text-[#00F5D4] mx-1" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#00F5D4]">2.</span>
                  <span>
                    Scrolle nach unten und wähle <strong>"Zum Home-Bildschirm"</strong>{' '}
                    <SquarePlus className="inline w-3.5 h-3.5 text-[#00F5D4] mx-1" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#00F5D4]">3.</span>
                  <span>
                    Tippe oben rechts auf <strong>Hinzufügen</strong>. Die App erscheint direkt auf deinem Startbildschirm!
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 rounded-lg bg-[#00F5D4] text-black font-mono font-bold text-xs uppercase hover:bg-[#00F5D4]/90 transition cursor-pointer"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowIOSModal(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-[#C9743F]/60 bg-[#C9743F]/15 text-white hover:bg-[#C9743F] hover:text-black transition-all cursor-pointer"
      title="App-Installationsanleitung"
    >
      <Download className="w-3.5 h-3.5 text-[#00F5D4]" />
      <span>App installieren</span>
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#0B1416] border border-[#00F5D4] p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowIOSModal(false);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#10191A] border border-[#C9743F] flex items-center justify-center font-mono font-black text-[#00F5D4]">
                &lt;/&gt;
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  CODE WWS als App installieren
                </h3>
                <p className="text-xs text-[#859B9E]">Vollwertige Desktop- &amp; Mobile-App</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Diese Anwendung ist eine vollumfängliche Progressive Web App (PWA). Du kannst sie über dein Browser-Menü installieren:
            </p>

            <ul className="text-xs text-gray-200 space-y-2 border-t border-gray-800 pt-3">
              <li>• <strong>Chrome / Edge / Brave:</strong> Klicke auf das Installations-Symbol in der Adressleiste oder wähle Menü ⋮ &gt; <em>"CODE WWS installieren"</em>.</li>
              <li>• <strong>iPhone / iPad (Safari):</strong> Teilen-Button &gt; <em>"Zum Home-Bildschirm"</em>.</li>
              <li>• <strong>Android:</strong> Menü ⋮ &gt; <em>"App installieren"</em> bzw. <em>"Zum Startbildschirm hinzufügen"</em>.</li>
            </ul>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowIOSModal(false);
              }}
              className="mt-5 w-full py-2.5 rounded-lg bg-[#00F5D4] text-black font-mono font-bold text-xs uppercase hover:bg-[#00F5D4]/90 transition"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </button>
  );
};
