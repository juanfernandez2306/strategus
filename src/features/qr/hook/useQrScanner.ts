// src/features/qr/hook/useQrScanner.ts
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner"; 
import { useQrManager } from "./useQrManager"; 

interface UseQrScannerProps {
    onSuccessMessage: (msg: string) => void;
    onErrorMessage: (msg: string) => void;
}

export const useQrScanner = ({ onSuccessMessage, onErrorMessage }: UseQrScannerProps) => {
    const scannerRef = useRef<QrScanner | null>(null);
    const procesandoRef = useRef<boolean>(false);
    
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [ultimoContenido, setUltimoContenido] = useState<string>("");
    const [conteoSesion, setConteoSesion] = useState<number>(0);

    const { procesarEscaneo, isProcessing } = useQrManager();

    // Recibe el elemento de video directamente desde el componente
    const iniciarEscaneo = async (videoElement: HTMLVideoElement | null) => {
        if (!videoElement) {
            onErrorMessage("El visor de video no está listo en el DOM.");
            return;
        }

        try {
            if (scannerRef.current) {
                scannerRef.current.destroy();
                scannerRef.current = null;
            }

            scannerRef.current = new QrScanner(
                videoElement,
                async (result: QrScanner.ScanResult) => {
                    const textoEscaneado = result.data;

                    // Candado de concurrencia y duplicados inmediatos
                    if (procesandoRef.current || textoEscaneado === ultimoContenido) {
                        return; 
                    }

                    procesandoRef.current = true;
                    setUltimoContenido(textoEscaneado);

                    const resultado = await procesarEscaneo(textoEscaneado);

                    if (resultado.success) {
                        setConteoSesion(prev => prev + resultado.cantidad);
                        onSuccessMessage(`¡Éxito! Se sincronizaron ${resultado.cantidad} registros.`);
                        detenerEscaneo();
                    } else {
                        onErrorMessage("No se pudo procesar el contenido del QR.");
                        procesandoRef.current = false;
                    }
                },
                {
                    onDecodeError: () => {},
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    maxScansPerSecond: 6,
                    preferredCamera: "environment"
                }
            );

            await scannerRef.current.start();
            setIsScannerActive(true);
        } catch (err) {
            console.error("Error de cámara:", err);
            onErrorMessage("No se pudo acceder a la cámara trasera del dispositivo.");
            setIsScannerActive(false);
        }
    };

    const detenerEscaneo = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.stop();
            } catch (e) {
                console.warn("El escáner ya estaba detenido:", e);
            }
            setIsScannerActive(false);
        }
    };

    // Corregido: Ahora recibe explícitamente el elemento de video en su propio ámbito
    const prepararSiguienteEscaneo = async (videoElement: HTMLVideoElement | null): Promise<string> => {
        setUltimoContenido("");
        procesandoRef.current = false;
        
        if (videoElement) {
            await iniciarEscaneo(videoElement);
            return "Escáner reiniciado";
        }
        throw new Error("El visor de video no está listo.");
    };

    // Limpieza automática al desmontar para evitar fugas de memoria del hardware de la cámara
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.destroy();
                } catch (e) {
                    console.error("Error al destruir escáner:", e);
                }
            }
        };
    }, []);

    return {
        iniciarEscaneo,
        detenerEscaneo,
        prepararSiguienteEscaneo,
        isScannerActive,
        conteoSesion,
        isProcessing
    };
};