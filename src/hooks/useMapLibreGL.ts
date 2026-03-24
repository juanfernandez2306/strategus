import { useEffect, useState, useRef, useCallback } from 'react';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { 
    crearInstanciaMapa, 
    datosGeoJsonSidebarData, 
} from '../services/servicioMapLibreGL';
import { configurarClusteresEnMapa } from '../services/servicioCapasMapa';
import { type SidebarData, CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from '../services/servicioTipos';
import { obtenerUltimaPosicion } from '../services/servicioMapLibreGL';
import { validarPuntoEnArea } from '../services/servicioGeolocalizacion';

/**
 * Hook para gestionar la lógica del mapa MapLibre y su interacción con IndexedDB.
 * @param onPointClick Función callback que se ejecuta al hacer click en un punto.
 */
export const useMapaLibreGLService = (onPointClick: (datos: SidebarData) => void) => {
    // Referencia persistente para la instancia del mapa
    const mapRef = useRef<MapLibreMap | null>(null);

    const ultimoMensajeRef = useRef<string | null>(null);

    const [mensajeError, setMensajeError] = useState<string | null>(null);

   
    useEffect(() => {
        const monitorearGps = () => {
            // CONSUMO DIRECTO DEL ORQUESTADOR
            const datos = obtenerUltimaPosicion();

            if (!datos) {
                console.log("⏳ Esperando primera posición del GPS...");
                return;
            }

            const errores: string[] = [];

            // Validación A: Precisión
            if (datos.precision > 20) {
                errores.push("Señal GPS débil (>20m)");
            }

            // Validación B: Área de Trabajo (Usando tu función de islas/dissolve)
            const estaDentro = validarPuntoEnArea(
                datos.lng, 
                datos.lat, 
                CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO
            );

            if (!estaDentro) {
                errores.push("Fuera del área de trabajo");
            }

            // 2. Creamos el string final (o null si no hay errores)
            const mensajeActual = errores.length > 0 ? errores.join(" | ") : null;

            // 3. --- FILTRO DE DISPARO INTELIGENTE ---
            // Comparamos el mensaje completo. Si algo cambió (se añadió un error, 
            // se quitó uno, o se limpiaron todos), entramos.
            if (mensajeActual !== ultimoMensajeRef.current) {
            
                ultimoMensajeRef.current = mensajeActual;
                setMensajeError(mensajeActual); // Actualiza la UI de MapLibreGL.tsx

                if (mensajeActual) {
                        console.warn(`ESTADO CRÍTICO: ${mensajeActual}`);
                    } else {
                        console.log("Sistema operativo: Posición y precisión OK.");
                    }
            }


        };

        monitorearGps();

        const intervalId = setInterval(monitorearGps, 500); //

        return () => {
          mapRef.current?.remove();
          mapRef.current = null;
          clearInterval(intervalId);
        };
      }, []);

    /**
     * Inicializa el mapa en el contenedor proporcionado y carga los datos iniciales.
     */
    const inicializarMapa = useCallback(async (contenedor: HTMLDivElement) => {
        if (mapRef.current) return; // Evita inicializar más de una vez

        // 1. Crear la instancia base del mapa
        const mapa = crearInstanciaMapa(contenedor);
        mapRef.current = mapa;

        // 2. Esperar a que el estilo cargue antes de añadir capas/fuentes
        mapa.on('load', async () => {
            // 3. Obtener GeoJSON desde IndexedDB
            const respuesta = await datosGeoJsonSidebarData();
            
            // 4. Configurar clústeres, capas y eventos de click
            configurarClusteresEnMapa(mapa, respuesta, onPointClick);
        });
    }, [onPointClick]);

    /**
     * Consulta nuevamente la base de datos y actualiza los puntos en el mapa.
     * Útil después de actualizar 'revision_planta' en el Sidebar.
     */
    const refrescarPunto = useCallback(async () => {
        if (!mapRef.current) return;

        // Obtener datos actualizados
        const respuesta = await datosGeoJsonSidebarData();

        // Actualizar la fuente de datos existente en el mapa
        configurarClusteresEnMapa(mapRef.current, respuesta, onPointClick);
    }, [onPointClick]);

    return {
        inicializarMapa,
        refrescarPunto,
        mapaInstancia: mapRef.current,
        mensajeError
    };
};