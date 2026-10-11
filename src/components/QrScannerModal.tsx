import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, RefreshCw, AlertCircle, CheckCircle2, SwitchCamera, Upload } from 'lucide-react';
import jsQR from 'jsqr';
import { playMultimeterBeep } from '../utils/audio';
import { useI18n } from '../i18n';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (ticketId: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const { t } = useI18n();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream cleanly
  const stopStream = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleDetectedCode = (rawCode: string) => {
    playMultimeterBeep(1400, 0.12);
    let orderId = rawCode.trim();

    // Check if JSON object from label {id: "RE-2026-..."}
    try {
      if (orderId.startsWith('{') && orderId.endsWith('}')) {
        const parsed = JSON.parse(orderId);
        if (parsed.id) orderId = parsed.id;
      }
    } catch {
      // Keep string as is
    }

    // If URL like https://.../status/CODE-9231 or ?id=CODE-9231
    const match = orderId.match(/(?:CODE-\d{4}|RE-\d{4}-\d+|KVA-\d{4}-\d+)/i);
    if (match) {
      orderId = match[0].toUpperCase();
    }

    setScannedResult(orderId);
    stopStream();

    setTimeout(() => {
      onScanSuccess(orderId);
      onClose();
    }, 800);
  };

  // Start camera stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setScannedResult(null);
      setCameraError(null);
      return;
    }

    let isCancelled = false;

    const startCamera = async () => {
      try {
        setCameraError(null);
        stopStream();

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
        }

        scanLoop();
      } catch (err: any) {
        console.warn('Camera access failed:', err);
        setCameraError(
          t('Kamerazugriff nicht möglich oder verweigert. Bitte erlaube den Zugriff auf deine Kamera im Browser oder lade ein Foto deines Etiketts hoch.')
        );
      }
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(scanLoop);
        return;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        handleDetectedCode(code.data);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(scanLoop);
    };

    startCamera();

    return () => {
      isCancelled = true;
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Handle uploaded image file scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDetectedCode(code.data);
        } else {
          alert(t('Kein lesbarer QR-Code auf diesem Foto gefunden. Bitte stelle sicher, dass der QR-Code gut ausgeleuchtet und scharf ist.'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label={t('QR-Code scannen')} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1416] border-2 border-[#00F5D4] rounded-2xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#050A0C] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/40 flex items-center justify-center text-[#00F5D4]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                {t('QR-Code Scanner')}
              </h3>
              <p className="text-[10px] font-mono text-[#839897]">
                {t('Auftrags-Etikett oder Reparatur-Beleg scannen')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Schließen')}
            className="p-1.5 rounded-lg text-[#839897] hover:text-[#FF8D4D] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Scanner Viewport */}
        <div className="relative aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay Frame */}
          {!cameraError && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-56 h-56 border-2 border-[#00F5D4] rounded-2xl shadow-[0_0_20px_rgba(0,245,212,0.4)]">
                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-1 bg-[#00F5D4] shadow-[0_0_12px_#00F5D4] animate-bounce" />
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
              </div>
            </div>
          )}

          {/* Scanned Success Banner */}
          {scannedResult && (
            <div className="absolute inset-0 bg-[#00F5D4]/20 backdrop-blur-xs flex flex-col items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-14 h-14 text-[#00F5D4] animate-bounce" />
              <div className="font-mono text-base font-extrabold text-white bg-black/80 px-4 py-1.5 rounded-xl border border-[#00F5D4]">
                ✓ {t('{id} erkannt!', { id: scannedResult })}
              </div>
            </div>
          )}

          {/* Camera Error View */}
          {cameraError && (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="text-xs font-mono text-[#F3F7F7] leading-relaxed">
                {cameraError}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#060B0C] font-mono text-xs font-bold uppercase hover:bg-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('Foto vom QR-Code hochladen')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-3 bg-[#050A0C] border-t border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg border border-white/15 text-[#839897] hover:text-white hover:border-[#00F5D4] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('Foto wählen')}</span>
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className="px-3 py-1.5 rounded-lg border border-white/15 text-[#839897] hover:text-white hover:border-[#00F5D4] transition-all flex items-center gap-1.5 cursor-pointer"
            title={t('Kamera wechseln')}
          >
            <SwitchCamera className="w-3.5 h-3.5" />
            <span>{t('Kamera drehen')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            {t('Abbrechen')}
          </button>
        </div>
      </div>
    </div>
  );
};
