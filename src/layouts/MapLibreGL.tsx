import { useEffect, useRef, useState } from 'react';
import { Box, Drawer, Typography, Button, IconButton, Stack, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// Importamos el nuevo hook de MapLibre
import { useMapaLibreGLService } from '../hooks/useMapLibreGL'; 
import { actualizarEstadoRevisionDB } from '../services/almacenamientoDB';
import { type SidebarData } from '../services/tipos';
import "maplibre-gl/dist/maplibre-gl.css";

export const MapaLibreGL: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Definimos el callback para el click antes de inicializar el hook
  const manejarClickMarker = (data: SidebarData) => {
    setDetallePunto(data);
    setIsSidebarOpen(true);
  };

  // 2. Extraemos las funciones del nuevo hook de MapLibre
  const { inicializarMapa, refrescarPunto } = useMapaLibreGLService(manejarClickMarker);

  // 3. Inicialización del contenedor del mapa
  useEffect(() => {
    if (mapDivRef.current) {
      inicializarMapa(mapDivRef.current);
    }
  }, [inicializarMapa]);

  // 4. Lógica de actualización de estado
  const handleUpdateStatus = async () => {
    if (!detallePunto) return;
    
    const nuevoEstado = !detallePunto.revision_planta;
    
    try {
      // Actualiza en IndexedDB
      await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);
      
      // Notifica al mapa para que refresque la fuente de datos y cambie el color del punto
      await refrescarPunto();
      
      // Actualiza el estado local para que el Sidebar refleje el cambio inmediatamente
      setDetallePunto({ ...detallePunto, revision_planta: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  return (
    <Box sx={{ 
        width: '100%', 
        height: 'calc(100dvh - 100px)', // Ajusta este valor al alto real de tu Header
        position: 'relative',
        overflow: 'hidden', // Evita que cualquier cosa dentro genere scroll
        margin: 0,
        padding: 0
    }}>
      {/* Contenedor donde MapLibre renderizará el canvas */}
      <Box ref={mapDivRef} sx={{ width: '100%', height: '100%' }} />

      {/* Sidebar de información */}
      <Drawer
        anchor="right"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary"
        // ESTO EVITA QUE EL CONTENEDOR SE MUEVA
        ModalProps={{
            disableScrollLock: true, 
        }}
        // Aseguramos que el Sidebar flote sobre el mapa sin empujarlo
        PaperProps={{
            sx: { 
            width: 320,
            height: 'calc(100vh - 64px)',
            top: '64px' 
            }
        }}
        >
        <Box sx={{ width: 320, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Detalle del Punto</Typography>
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          
          {detallePunto && (
            <Stack spacing={2}>
              <Typography variant="body2"><b>ID:</b> {detallePunto.uuid}</Typography>
              <Typography variant="body2">
                <b>Estado:</b> {detallePunto.revision_planta ? 'Revisado' : 'Pendiente'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <b>Ubicación:</b> {detallePunto.lat.toFixed(5)}, {detallePunto.lng.toFixed(5)}
              </Typography>
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleUpdateStatus}
                color={detallePunto.revision_planta ? "secondary" : "primary"}
              >
                {detallePunto.revision_planta ? "Marcar como Pendiente" : "Confirmar Revisión"}
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};