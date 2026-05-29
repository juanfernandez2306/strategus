import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './MapLibre.module.css';


// --- NUEVOS HOOKS REFACTORIZADOS ---
import { useMapa } from './hooks/useMap';
import { useSensorManager } from './sensor/useSensorManager';
import { useSistemaStore } from './hooks/useSistemaStore';
import { useNavigation } from './hooks/useNavegation';



// --- SERVICIOS Y TIPOS ---
import { actualizarEstadoRevisionDB } from '../../services/indexedbd/palmaActions'; 
import { type SidebarData } from '../../types';
import Compass, { type CompassHandle }  from './components/Compass';

import "maplibre-gl/dist/maplibre-gl.css";
import { type Map as MapLibreMap } from 'maplibre-gl';

import { ConfirmButton } from './components/BtnRevision';

import { useMapSensorSync } from './hooks/useMapUserUpdate';


export const MapLibre: React.FC = () => {

  //activando sensores gps y brujula
  useSensorManager();

  const sistemaListo = useSistemaStore((s) => s.sistemaListo);
  const mensajeError = useSistemaStore((s) => s.mensajeError);

  const mapDivRef = useRef<HTMLDivElement>(null);

  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  

  const compassRef = useRef<CompassHandle>(null);

  const sistemaListoRef = useRef(sistemaListo);
  useEffect(() => { sistemaListoRef.current = sistemaListo; }, [sistemaListo]);

  
  const handlePointClick = useCallback((datos: SidebarData) => {
    
    if (!sistemaListoRef.current) {
      console.warn("Interacción bloqueada: Sensores no listos");
      return; 
    }
    
    setDetallePunto(datos);
    setIsSidebarOpen(true);

  }, []);

  // 2. Inicialización del nuevo Hook de Mapa
  const { inicializarMapa, refrescarPunto, mapInstance } = useMapa(handlePointClick);

  useMapSensorSync(mapInstance, sistemaListo);
  
  useNavigation(
    detallePunto?.lat ?? null,
    detallePunto?.lng ?? null,
    compassRef
  );

useEffect(() => {

    let instanciaMapaLocal: MapLibreMap | null = null;

    let componenteMontado = true;

    const montarSistema = async () => {

      if (!mapDivRef.current) return;

      const mapa = await inicializarMapa(mapDivRef.current);

      if (!componenteMontado) {
        console.log("Abortando: El componente se desmontó antes de que el mapa terminara de cargar");
        mapa?.remove();
        return;
      }

      if (mapa) instanciaMapaLocal = mapa;

    };

    montarSistema();

    return () => {
      componenteMontado = false;
      if (instanciaMapaLocal) {
        console.log("Limpiando instancia de mapa...");
        instanciaMapaLocal.remove();
      };
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

    <div className={`${styles.snackbarError} ${mensajeError ? styles.visible : styles.hidden}`}>
      {mensajeError}
    </div>

  </div>
  );
};