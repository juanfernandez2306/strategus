import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './MapLibre.module.css';


// --- NUEVOS HOOKS REFACTORIZADOS ---
import { useMapa } from './hooks/useMap'; 
import { useNavigation } from './hooks/useNavegation';
import { useSensorError } from './hooks/useSensorError';


// --- SERVICIOS Y TIPOS ---
import { actualizarEstadoRevisionDB } from '../../services/indexedbd/palmaActions'; 
import { type SidebarData } from '../../types';
import Compass, { type CompassHandle }  from '../../components/Compass';

import "maplibre-gl/dist/maplibre-gl.css";
import { type Map as MapLibreMap } from 'maplibre-gl';

import { ConfirmButton } from './components/BtnRevision';


export const MapLibre: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { mensajeError, sistemaListo } = useSensorError();

  // Referencia para la brújula (actualizada por el navOrchestrator a 60fps)
  const compassRef = useRef<CompassHandle>(null);
  
  const [displayError, setDisplayError] = useState<string | null>(null);

  const mensajeErrorRef = useRef<string | null>(null);

  const sistemaListoRefGlobal = useRef<boolean>(false);

  useEffect(() => {
      sistemaListoRefGlobal.current = sistemaListo;
  }, [sistemaListo]);
  

  // 1. Callback de click en punto (se pasa al orquestador a través del hook)
  const handlePointClick = useCallback((datos: SidebarData) => {
    
    if (!sistemaListoRefGlobal.current) {
        console.warn("Bloqueado: Sensores no listos");
        return; 
    }
    
    setDetallePunto(datos);
    setIsSidebarOpen(true);
  }, []);

  // 2. Inicialización del nuevo Hook de Mapa
  const { inicializarMapa, refrescarPunto } = useMapa(handlePointClick);

  // Sincronizamos el ref de mensaje para el callback de click
  useEffect(() => {

    mensajeErrorRef.current = mensajeError;

    if (mensajeError) setDisplayError(mensajeError);
    

  }, [mensajeError]);
  
  // 3. Activación del Hook de Navegación
  // Se encarga de encender/apagar el navOrchestrator automáticamente
  useNavigation(
    detallePunto?.lat ?? null,
    detallePunto?.lng ?? null,
    compassRef
  );

useEffect(() => {

    let instanciaMapaLocal: MapLibreMap | null = null;

    const montarSistema = async () => {

      if (!mapDivRef.current) return;

      const mapa = await inicializarMapa(mapDivRef.current);

      if (mapa) instanciaMapaLocal = mapa;

    };

    montarSistema();

    return () => {
      if (instanciaMapaLocal) instanciaMapaLocal.remove();
    };
    
  }, [inicializarMapa]);
  
  // 5. Lógica de negocio (Actualización de DB y Refresco de Capas)
  const handleConfirmarVisita = async () => {
    if (!detallePunto) return;

    const nuevoEstado = !detallePunto.revision_planta;
    const exito = await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);

    if (exito) {
      setDetallePunto({ ...detallePunto, revision_planta: nuevoEstado });
      // Refrescamos solo la capa de puntos/clústeres sin recargar el mapa
      refrescarPunto();
    }
  };

  return (
    <div className={styles.screenContainer}>
    <div ref={mapDivRef} className={styles.mapCanvas} />

    {/* El Overlay ahora siempre está en el DOM, pero oculto por CSS */}
    <div 
      className={`${styles.drawerOverlay} ${isSidebarOpen ? styles.overlayActive : ''}`} 
      onClick={() => setIsSidebarOpen(false)}
    >
      <div 
        className={`${styles.drawerPaper} ${isSidebarOpen ? styles.drawerOpen : ''}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button className={styles.btnClose} onClick={() => setIsSidebarOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Usamos renderizado condicional solo para el contenido pesado si quieres, 
            pero para la animación es mejor que el contenedor exista */}
        {detallePunto && (
          <>
            <Compass ref={compassRef} size={260} />
            <ConfirmButton 
              onClick={handleConfirmarVisita} 
              detallePunto={detallePunto} 
            />
          </>
        )}
      </div>
    </div>

    <div className={`${styles.snackbar} ${mensajeError ? styles.snackbarActive : ''}`}>
      {/* Mostramos el mensaje actual o el último conocido para que no desaparezca el texto antes que el cuadro */}
      {mensajeError || displayError}
    </div>

  </div>
  );
};