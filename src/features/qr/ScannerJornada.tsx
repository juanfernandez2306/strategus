// src/features/qr/ScannerJornada.tsx
import { useState, useRef, useEffect } from "react";
import { useQrScanner } from "./hook/useQrScanner";
import styleScanner from './ScannerJornada.module.css';

import IconScanQR from "../../components_svg/IconScanQR";

const ScannerJornada = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ texto: string; error: boolean } | null>(null);

    
    const { 
        iniciarEscaneo,
        detenerEscaneo,
        prepararSiguienteEscaneo,
        isScannerActive,
        conteoSesion,
        isProcessing 
    } = useQrScanner({
        onSuccessMessage: (msg) => setStatusMsg({ texto: msg, error: false }),
        onErrorMessage: (msg) => setStatusMsg({ texto: msg, error: true })
    });

    useEffect(() => {
        if (videoRef.current) {
            iniciarEscaneo(videoRef.current);
        }
        return () => detenerEscaneo();
    }, []); 

    const handleAccionBoton = async (): Promise<string> => {
        setStatusMsg(null);
        return await prepararSiguienteEscaneo(videoRef.current);
    };

    const statusClassName = statusMsg
    ? `${styleScanner.statusDisplay} ${statusMsg.error ? styleScanner.statusError : styleScanner.statusExito}`
    : '';

    return (
        <section className={styleScanner.contenedorScanner}>

                <h3 className={styleScanner.titulo}>SINCRONIZACION P2P SCANNER</h3>

                <section className={styleScanner.contenedorLogo}>
                    <figure className={styleScanner.contenedorFigura}>
                        <IconScanQR width={70} height={70} />
                    </figure>
                    
                    <div className={styleScanner.ContenedorEtiquetaCorta}>
                        <span className={styleScanner.etiquetaCorta}>
                            REGISTROS CAPTURADOS
                        </span>
                        <h3 className={styleScanner.numeroGrande}>
                            {conteoSesion}
                        </h3>
                    </div>
                </section>

                <div className={styleScanner.scannerWrapper}>
                    <video ref={videoRef} className={styleScanner.videoElemento} playsInline muted />
                    <div className={styleScanner.overlay} />
                    {isScannerActive && <div className={styleScanner.laserAnimacion} />}
                </div>

                {statusMsg && (
                    <div className={statusClassName}>
                        {isProcessing ? "Escribiendo en IndexedDB..." : statusMsg.texto}
                    </div>
                )}

                <section className={styleScanner.contenedorBoton}>
                    {!isScannerActive ? (
                        <button 
                            className={styleScanner.submit} 
                            onClick={handleAccionBoton}
                        >
                            {statusMsg ? "Escanear Siguiente Parte" : "Activar Cámara"}
                        </button>
                    ) : (
                        <button 
                            className={[styleScanner.submit, styleScanner.reset].join(' ')} 
                            onClick={detenerEscaneo} >
                            Detener Escáner
                        </button>
                    )}
                </section>
            
        </section>
    );
};

export default ScannerJornada;