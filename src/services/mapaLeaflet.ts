import L from "leaflet";
import "leaflet.markercluster";
import { type SidebarData } from "./tipos";

export const crearSVGIcon = (revisado: boolean): L.DivIcon => {
  
  const claseEstado = revisado ? 'marker-revisado' : 'marker-pendiente';
  
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;

  return L.divIcon({
    html: svgTemplate,
    className: `custom-pwa-icon ${claseEstado}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export const inicializarServicioClusters = (
  map: L.Map,
  datos: SidebarData[],
  onMarkerClick: (data: SidebarData) => void
): { 
  clusterGroup: L.MarkerClusterGroup; 
  markersMap: Map<string, L.Marker>
} => {
  const clusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  const markersMap = new Map<string, L.Marker>();

  datos.forEach((registro) => {
    
    const marker = L.marker([registro.lat, registro.lng], {
      icon: crearSVGIcon(registro.revision_planta)
    });

    marker.on('click', () => {
      // Enviamos exactamente los datos del SidebarData
      onMarkerClick({
        uuid: registro.uuid,
        lat: registro.lat,
        lng: registro.lng,
        revision_planta: registro.revision_planta
      });
    });

    markersMap.set(registro.uuid, marker);
    clusterGroup.addLayer(marker);
  });

  map.addLayer(clusterGroup);

  return { clusterGroup, markersMap };
};

export const actualizarMarcadorEnCluster = (
  uuid: string,
  estaRevisado: boolean,
  markersMap: Map<string, L.Marker>,
  clusterGroup: L.MarkerClusterGroup
): void => {
  const marker = markersMap.get(uuid);
  
  if (marker) {
    // Actualización directa del icono con el nuevo boolean
    marker.setIcon(crearSVGIcon(estaRevisado));
    
    // Refresca el clúster para procesar el cambio visual
    clusterGroup.refreshClusters(marker);
  }
};

