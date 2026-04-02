import { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const useQrScanner = (elementId: string) => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  const iniciarEscaneo = async (onScanSuccess: (text: string) => void) => {
    try {
      const qrcodeScanner = new Html5Qrcode(elementId);
      setScanner(qrcodeScanner);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      };

      await qrcodeScanner.start(
        { facingMode: "environment" }, // Cámara trasera
        config,
        (decodedText) => {
          // Cuando detecta un código, lo enviamos al callback
          onScanSuccess(decodedText);
        },
        undefined // Ignoramos errores de frame (muy comunes)
      );

      setIsScannerActive(true);
    } catch (err) {
      console.error("No se pudo iniciar la cámara", err);
      throw err;
    }
  };

  const detenerEscaneo = async () => {
    if (scanner && scanner.isScanning) {
      await scanner.stop();
      setIsScannerActive(false);
    }
  };

  return { iniciarEscaneo, detenerEscaneo, isScannerActive };
};