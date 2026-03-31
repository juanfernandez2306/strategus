import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import FormBaseLayout from "../components/FormLayoutBase";
import styleBase from '../components/FormLayoutBase.module.css';
import { obtenerRegistrosPosicionPorFecha } from "../services/indexedbd/palmaQueries.ts"; 
import { useQrManager } from "../hooks/useQrManager";

const GenerarQrJornada = () => {
    const [fecha, setFecha] = useState<string>("");
    const [listaQrs, setListaQrs] = useState<string[]>([]);
    const { generarQrsComprimidos } = useQrManager();
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const [isGenerated, setIsGenerated] = useState(false);

    useEffect(() => {
        setListaQrs([]);
    }, [fecha]);

    useEffect(() => {
        if (listaQrs.length > 0 && qrContainerRef.current) {
            qrContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [listaQrs]);

    const handleExecute = async () => {
        if (!fecha) throw new Error("Debe seleccionar una fecha");
        setListaQrs([]); 

        const registros = await obtenerRegistrosPosicionPorFecha(fecha);
        if (!registros || registros.length === 0) throw new Error("No hay registros");

        // Manteniendo los 5 puntos para máxima claridad
        const qrs = generarQrsComprimidos(registros, 6);
        setListaQrs(qrs);

        setIsGenerated(true)

        return `Listo: ${qrs.length} QR generados.`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <FormBaseLayout
                titulo="Generar QR de Jornada"
                buttonText="Crear Códigos"
                iconoCustom={<div style={{fontSize: '4rem'}}>📱</div>} 
                onExecute={handleExecute}
                disabled={isGenerated}
            >
                <aside className={styleBase.groupInput}>
                    <label htmlFor="fecha">Fecha de la Jornada</label>
                    <input 
                        id="fecha" 
                        type="date"  
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '2px solid var(--color-primario)' }}
                    />
                </aside>
            </FormBaseLayout>

            {/* CONTENEDOR SIN FONDO GRIS */}
            {listaQrs.length > 0 && (
                <div 
                    ref={qrContainerRef}
                    style={{ 
                        marginTop: '1rem', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '40px', 
                        width: '100%',
                        padding: '2rem 0' 
                    }}
                >
                    {listaQrs.map((qrData, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                                PARTE {index + 1}
                            </p>
                            
                            <QRCodeSVG 
                                value={qrData} 
                                // Tamaño dinámico para que no se pierda el centrado
                                size={window.innerWidth < 350 ? 280 : 320} 
                                level="M" 
                                includeMargin={true}
                                style={{ 
                                    backgroundColor: '#fff',
                                    border: '1px solid #eee', // Borde sutil solo para delimitar
                                    borderRadius: '10px'
                                }} 
                            />
                        </div>
                    ))}
                    
                    <button 
                        onClick={() => { 
                            setListaQrs([]); setFecha("");
                            setIsGenerated(false); 
                        }}
                        style={{
                            marginTop: '1rem',
                            padding: '12px 24px',
                            backgroundColor: 'transparent',
                            color: '#cc0000',
                            border: '2px solid #cc0000',
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Limpiar pantalla
                    </button>
                </div>
            )}
        </div>
    );
};

export default GenerarQrJornada;