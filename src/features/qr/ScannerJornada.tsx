// src/features/qr/ScannerJornada.tsx
import { useState, useRef, useEffect } from "react";
import { useQrScanner } from "./hook/useQrScanner";
import styleBase from '../../components/FormLayoutBase.module.css';
import styleScanner from './ScannerJornada.module.css'; 

const ScannerJornada = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ texto: string; error: boolean } | null>(null);

    // ✅ CORREGIDO: Ya no da error porque no exige videoElement al instanciar
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
        // ✅ CORREGIDO: Se le pasa la referencia del nodo de video directamente
        return await prepararSiguienteEscaneo(videoRef.current);
    };

    return (
        <div className={styleBase.formularioContenedor} style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className={styleBase.formCard}>
                <header className={styleBase.formHeader}>
                    <h2 className={styleBase.tituloForm}>{`Sincronización P2P`}</h2>
                    <p className={styleBase.subtituloForm}>Panel de Recepción de Jornadas</p>
                </header>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-texto-secundario)' }}>
                        Registros capturados en esta sesión:
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primario)' }}>
                        {conteoSesion}
                    </div>
                </div>

                <div className={styleScanner.scannerWrapper}>
                    <video ref={videoRef} className={styleScanner.videoElemento} playsInline muted />
                    <div className={styleScanner.overlay} />
                    {isScannerActive && <div className={styleScanner.laserAnimacion} />}
                </div>

                {statusMsg && (
                    <div className={styleScanner.statusDisplay} style={{
                        backgroundColor: statusMsg.error ? 'rgba(204,0,0,0.8)' : 'rgba(76,175,80,0.9)',
                        color: '#fff'
                    }}>
                        {isProcessing ? "Escribiendo en IndexedDB..." : statusMsg.texto}
                    </div>
                )}

                <div className={styleBase.groupInput} style={{ marginTop: '1.5rem' }}>
                    {!isScannerActive ? (
                        <button 
                            className={styleBase.submit} 
                            onClick={handleAccionBoton} 
                            style={{ fontWeight: 'bold', fontSize: '1.2rem' }}
                        >
                            {statusMsg ? "Escanear Siguiente Parte" : "Activar Cámara"}
                        </button>
                    ) : (
                        <button 
                            className={styleBase.submit} 
                            onClick={detenerEscaneo} 
                            style={{ backgroundColor: '#cc0000', color: '#fff', border: 'none' }}
                        >
                            Detener Escáner
                        </button>
                    )}
                </div>

                <footer style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#FFF799', textAlign: 'center' }}>
                    Asegúrese de que el QR esté dentro del marco de la cámara.
                </footer>
            </div>
        </div>
    );
};

export default ScannerJornada;