import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { inicializarServicioClusters, actualizarMarcadorEnCluster } from "../services/mapaLeaflet"
import { obtenerRegistroSidebarData } from "../services/almacenamientoDB";
import { type SidebarData } from "../services/tipos";

export const useMapaService = (onMarkerClick: (data: SidebarData) => void) => {
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const inicializando = useRef(false);

  const inicializarMapa = async (contenedor: HTMLDivElement) => {
  if (mapRef.current || inicializando.current) return;
  inicializando.current = true;

  try {
    // 1. Instancia del Mapa con maxZoom (necesario para clústeres)
    const map = L.map(contenedor, {
      maxZoom: 19
    }).setView([10.48, -66.90], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(map);

    // IMPORTANTE: Forzar que Leaflet detecte el tamaño del contenedor
    // Esto evita el error de '_leaflet_pos'
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    mapRef.current = map;

    // 2. Locate Control (Opcional, envuelto para seguridad)
    try {
      if ((L.control as any).locate) {
        (L.control as any).locate({ position: 'topleft' }).addTo(map).start();
      }
    } catch (e) { console.warn(e); }

    // 3. Carga de Datos
    const datos = await obtenerRegistroSidebarData();
    
    if (datos && datos.length > 0) {
      // Usamos whenReady para asegurar que el mapa puede recibir capas
      map.whenReady(() => {
        const { clusterGroup, markersMap } = inicializarServicioClusters(
          map,
          datos,
          onMarkerClick
        );
        clusterGroupRef.current = clusterGroup;
        markersMapRef.current = markersMap;
      });
    }

  } catch (error) {
    console.error("Error al inicializar mapa:", error);
  } finally {
    inicializando.current = false;
  }
};

  const refrescarPunto = (uuid: string, estado: boolean) => {
    if (clusterGroupRef.current && markersMapRef.current) {
      actualizarMarcadorEnCluster(
        uuid,
        estado,
        markersMapRef.current,
        clusterGroupRef.current
      );
    }
  };

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return { inicializarMapa, refrescarPunto };
};