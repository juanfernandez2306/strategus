import { useRef, useEffect, useState, useCallback } from 'react';
import { useSistemaStore } from '../hooks/useSistemaStore';

import "maplibre-gl/dist/maplibre-gl.css";
import { type Map as MapLibreMap } from 'maplibre-gl';

import { type SidebarData } from '../../../types';
import { useMapa } from '../hooks/useMap';

import { useSensorManager } from '../sensor/useSensorManager';
import { useUserLocation } from '../sensor/renderUserLocation/useUserLocation';

import { actualizarEstadoRevisionDB } from '../../../services/indexedbd/palmaActions';

import type { CompassHandle } from '../components/Compass';


export const useMapLibreGLmanager = () => {
    const mapDivRef = useRef<HTMLDivElement>(null);
    const compassRef = useRef<CompassHandle>(null);

    const mensajeError = useSistemaStore((s) => s.mensajeError);

    const {setProximityMode, setPosicionDestino} = useSistemaStore()

    

    /** */
    

    const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    
    const sistemaListo = useSistemaStore((s) => s.sistemaListo);

    

    const handlePointClick = useCallback((datos: SidebarData) => {
        
            
        setDetallePunto(datos);
        setIsSidebarOpen(true);
        setPosicionDestino({
            lng: datos.lng,
            lat: datos.lat
        })
    
      }, []);

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

    
    const handleCerrarSidebar = useCallback(() => {

        setIsSidebarOpen(false);
        setDetallePunto(null);
        setPosicionDestino(null);
        setProximityMode(false);
        
    }, [setPosicionDestino]);

    /** */
    const { inicializarMapa, refrescarPunto  } = useMapa(handlePointClick);

    const { encenderSensores } = useSensorManager(compassRef);

    const { conectarSincronizacionStore } = useUserLocation();
    

    /** */

    

    /** */

    const instanciaMapaLocalRef = useRef<MapLibreMap | null>(null);

    // Almacenamos la función de apagado de sensores en un Ref para el cleanup asíncrono
    const apagarSensoresRef = useRef<(() => void) | null>(null);

    const apagarSincronizacionUsuario = useRef<(() => void) | null>(null);

    useEffect(() => {

        
        let componenteMontado = true;
        

        /**inicia funcion de montaje sistema */
        const montarSistema = async () => {

            if (!mapDivRef.current) return;

            const mapa = await inicializarMapa(mapDivRef.current);

            if (!componenteMontado) {
                console.log("Abortando: El componente se desmontó antes de que el mapa terminara de cargar");
                mapa?.remove();
                return;
            }

            if (mapa) {

                instanciaMapaLocalRef.current = mapa;

                apagarSensoresRef.current = encenderSensores();

                apagarSincronizacionUsuario.current = conectarSincronizacionStore(mapa);

            }

        };

        /**fin funcion de montaje sistema */

        montarSistema();

        return () => {
            
            componenteMontado = false;

            if (apagarSincronizacionUsuario.current){
                apagarSincronizacionUsuario.current();
                apagarSincronizacionUsuario.current = null;
            }

            if (apagarSensoresRef.current) {
                apagarSensoresRef.current();
                apagarSensoresRef.current = null;
            }

            if (instanciaMapaLocalRef.current) {
                console.log("Limpiando instancia de mapa...");
                instanciaMapaLocalRef.current.remove();
                instanciaMapaLocalRef.current = null;
            };

        };
    
  }, [inicializarMapa]);

    return {
        mapDivRef,
        mensajeError,
        detallePunto,
        isSidebarOpen,
        handleCerrarSidebar,
        handleConfirmarVisita,
        sistemaListo,
        compassRef
    }
    
}