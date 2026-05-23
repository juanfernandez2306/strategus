import { useRef, useEffect, useState, useCallback } from 'react';
import { useSistemaStore } from '../hooks/useSistemaStore';

import "maplibre-gl/dist/maplibre-gl.css";
import { type Map as MapLibreMap } from 'maplibre-gl';

import { type SidebarData } from '../../../types';
import { useMapa } from '../hooks/useMap';

import { useSensorManager } from '../sensor/useSensorManager';
import { useUserLocation } from '../sensor/renderUserLocation/useUserLocation';

export const useMapLibreGLmanager = () => {
    const mapDivRef = useRef<HTMLDivElement>(null);
    const mensajeError = useSistemaStore((s) => s.mensajeError);
    const sistemaListo = useSistemaStore((s) => s.sistemaListo);

    /** */
    const sistemaListoRef = useRef(sistemaListo);
    useEffect(() => { sistemaListoRef.current = sistemaListo; }, [sistemaListo]);

    const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    


    const handlePointClick = useCallback((datos: SidebarData) => {
        
        if (!sistemaListoRef.current) {
          console.warn("Interacción bloqueada: Sensores no listos");
          return; 
        }
        
        setDetallePunto(datos);
        setIsSidebarOpen(true);
    
      }, []);

    /** */
    const { inicializarMapa  } = useMapa(handlePointClick);

    const { encenderSensores } = useSensorManager();

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
        isSidebarOpen
    }
    
}