import { useState, useRef } from "react";
import { useQrScanner } from "./hook/useQrScanner";
import { useQrManager } from "./hook/useQrManager";
import styleBase from '../components/FormLayoutBase.module.css';
// Importamos el CSS del visor táctico que definimos antes
import styleScanner from './ScannerJornada.module.css'; 

const ScannerJornada = () => {
    const VIEW_ID = "reader-container-jornada";
    const [statusMsg, setStatusMsg] = useState<{ texto: string; error: boolean } | null>(null);

    const { iniciarEscaneo, detenerEscaneo, isScannerActive } = useQrScanner(VIEW_ID);
    const { procesarEscaneo, isProcessing } = useQrManager();

    // 1. Definir el estado para el candado
    const [ultimoContenido, setUltimoContenido] = useState<string>("");

    const [conteoSesion, setConteoSesion] = useState<number>(0);

    const procesandoRef = useRef<boolean>(false);

    const prepararSiguienteEscaneo = async () => {
        // 1. Limpiamos el mensaje de éxito/error de la pantalla
        setStatusMsg(null);
        
        // 2. Liberamos el candado de texto para que permita leer un nuevo QR
        setUltimoContenido(""); 
        
        // 3. Reseteamos la referencia de control (esto es lo que evita el bloqueo)
        procesandoRef.current = false; 
        
        // 4. Reactivamos la cámara físicamente
        try {
            await iniciarEscaneo(handleOnScan);
        } catch (err) {
            setStatusMsg({ texto: "Error al reactivar cámara", error: true });
        }
    };

    const handleOnScan = async (decodedText: string) => {
    // 1. BLOQUEO INSTANTÁNEO: Si ya estamos procesando, ignoramos CUALQUIER otra llamada
    if (procesandoRef.current || decodedText === ultimoContenido) {
        return;
    }

    procesandoRef.current = true;
    setUltimoContenido(decodedText);

    try {

        // 2. DETENER CÁMARA PRIMERO: Esto elimina el parpadeo visual
    // Al detener el motor del escáner, dejamos de recibir frames
    await detenerEscaneo(); 
    
    setUltimoContenido(decodedText);

    // 3. PROCESAR: Aquí entra la lógica de upsert por UUID
    const resultado = await procesarEscaneo(decodedText);

    if (resultado.success) {

            // Sumamos la cantidad de puntos que venían en este QR al total de la sesión
            setConteoSesion(prev => prev + resultado.cantidad);

            // Al estar la cámara ya detenida, este mensaje se queda fijo
            setStatusMsg({ 
            texto: `Sincronizados ${resultado.cantidad} puntos.`, 
            error: false 
            });
    } else {
        setStatusMsg({ 
        texto: "Error en el formato del QR.", 
        error: true 
        });
    }

    } catch (err){

        setStatusMsg({ 
            texto: "Error al procesar", 
            error: true 
        })

        procesandoRef.current = false;

    }
};

    return (
        <div className={styleBase.formContainer} style={{ backgroundColor: '#000', minHeight: '100vh' }}>
            <div className={styleBase.form} style={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                maxWidth: '500px' 
            }}>
                
                <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--color-primario)', margin: 0 }}>Escáner de Recepción</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Sector: El Danubio</p>
                    <div style={{ 
                        display: 'inline-block', 
                        backgroundColor: '#333', 
                        color: 'var(--color-fondo)', 
                        padding: '2px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        marginTop: '5px',
                        border: '1px solid var(--color-primario)'
                    }}>
                        Sincronizados en sesión: <strong>{conteoSesion}</strong>
                    </div>
                </header>

                {/* VISOR TÁCTICO: Optimizado para reflejos del sol */}
                <div className={styleScanner.scannerWrapper}>
                    <div id={VIEW_ID} className={styleScanner.videoContainer} />
                    {isScannerActive && (
                        <div className={styleScanner.overlay}>
                            <div className={styleScanner.guia} />
                        </div>
                    )}
                    {!isScannerActive && !isProcessing && (
                        <div style={{ 
                            position: 'absolute', 
                            color: '#666', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center' 
                        }}>
                            <span style={{ fontSize: '3rem' }}>📷</span>
                            <p>Cámara inactiva</p>
                        </div>
                    )}
                </div>

                {/* FEEDBACK DE ESTADO */}
                {(statusMsg || isProcessing) && (
                    <div style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginTop: '1rem',
                        backgroundColor: isProcessing ? '#333' : (statusMsg?.error ? '#440000' : '#004400'),
                        border: `1px solid ${statusMsg?.error ? '#ff4d4d' : '#4dff4d'}`,
                        color: '#fff'
                    }}>
                        {isProcessing ? "Escribiendo en IndexedDB..." : statusMsg?.texto}
                    </div>
                )}

                <div className={styleBase.groupInput} style={{ marginTop: '1.5rem' }}>
                    {!isScannerActive ? (
                        <button 
                            className={styleBase.submit} 
                            // CAMBIO: Ahora llamamos a la función de limpieza completa
                            onClick={prepararSiguienteEscaneo} 
                            style={{ fontWeight: 'bold', fontSize: '1.2rem' }}
                        >
                            {statusMsg ? "Escanear Siguiente Parte" : "Activar Cámara"}
                        </button>
                    ) : (
                        <button 
                            className={styleBase.submit} 
                            onClick={detenerEscaneo} //
                            style={{ backgroundColor: '#cc0000', color: '#fff', border: 'none' }}
                        >
                            Detener Escáner
                        </button>
                    )}
                </div>

                <footer style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555' }}>
                    Asegúrese de que el QR esté dentro del marco amarillo.
                </footer>
            </div>
        </div>
    );
};

export default ScannerJornada;