import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Scan, Keyboard } from 'lucide-react';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Play audio beep upon successful scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  const handleDetectedCode = (rawCode: string) => {
    const cleaned = rawCode.trim();
    if (!cleaned) return;
    playBeep();
    onScanSuccess(cleaned);
    onClose();
  };

  // Start Camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Kamera-Zugriff fehlgeschlagen:', err);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Kamerazugriff wurde im Browser verweigert. Bitte in den Einstellungen erlauben.'
          : 'Keine Kamera gefunden oder Zugriff blockiert.'
      );
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Detection loop using BarcodeDetector if available
  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    let detector: any = null;
    if ('BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'data_matrix'],
        });
      } catch (e) {
        console.warn('BarcodeDetector initialisation error:', e);
      }
    }

    const checkFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(checkFrame);
        return;
      }

      if (detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const detectedVal = barcodes[0].rawValue;
            if (detectedVal) {
              handleDetectedCode(detectedVal);
              return;
            }
          }
        } catch {}
      }

      animationFrameRef.current = requestAnimationFrame(checkFrame);
    };

    animationFrameRef.current = requestAnimationFrame(checkFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0C1517] border border-[#00F5D4]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#142628] bg-[#080E10]">
          <div className="flex items-center gap-2 text-[#00F5D4]">
            <Scan className="w-5 h-5 animate-pulse" />
            <h3 className="font-mono font-bold text-sm tracking-wider uppercase">
              Geräte-Etikett / QR Scanner
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {errorMsg ? (
            <div className="p-6 text-center text-zinc-400 max-w-xs">
              <AlertCircle className="w-10 h-10 text-[#FF5252] mx-auto mb-3" />
              <p className="text-xs mb-4">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00F5D4]/20 border border-[#00F5D4] text-[#00F5D4] text-xs font-mono font-bold rounded-lg cursor-pointer hover:bg-[#00F5D4] hover:text-black transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kamera erneut testen</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Overlay Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-[#00F5D4]/80 rounded-xl relative shadow-[0_0_20px_rgba(0,245,212,0.25)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#00F5D4] rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#00F5D4] rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#00F5D4] rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#00F5D4] rounded-br" />

                  {/* Scanning beam animation */}
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#00F5D4] to-transparent animate-scan" />
                </div>
              </div>

              <div className="absolute bottom-3 inset-x-4 text-center">
                <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[11px] font-mono text-[#00F5D4] border border-[#00F5D4]/30 shadow">
                  Etikett oder QR-Code im Rahmen zentrieren
                </span>
              </div>
            </>
          )}
        </div>

        {/* Manual Fallback Input */}
        <div className="p-4 bg-[#080E10] border-t border-[#142628] space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                handleDetectedCode(manualCode);
              }
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Auftragsnummer eingeben (z. B. RE-2026-...)"
                className="w-full pl-9 pr-3 py-2 bg-[#0C1517] border border-zinc-700 focus:border-[#00F5D4] rounded-lg text-xs font-mono text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-[#00F5D4] text-black font-mono font-bold text-xs rounded-lg hover:bg-[#00cbb0] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Öffnen
            </button>
          </form>

          <p className="text-[11px] text-zinc-400 text-center font-mono">
            Tipp: Funktioniert mit jedem Reparatur-Aufkleber &amp; KVA-Barcode
          </p>
        </div>
      </div>
    </div>
  );
};
