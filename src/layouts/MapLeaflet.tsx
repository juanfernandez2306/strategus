import { useEffect, useRef, useState } from 'react';
import { Box, Drawer, Typography, Button, IconButton, Stack, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMapaService } from '../hooks/useMapaLeaflet';
import { actualizarEstadoRevisionDB } from '../services/almacenamientoDB';
import { type SidebarData } from '../services/tipos';

export const MapaFullLayout: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Callback que inyecta los datos al Sidebar
  const manejarClickMarker = (data: SidebarData) => {
    setDetallePunto(data);
    setIsSidebarOpen(true);
  };

  const { inicializarMapa, refrescarPunto } = useMapaService(manejarClickMarker);

  useEffect(() => {
    if (mapDivRef.current) {
      inicializarMapa(mapDivRef.current);
    }
  }, []);

  const handleUpdateStatus = async () => {
    if (!detallePunto) return;
    const nuevoEstado = !detallePunto.revision_planta;
    
    // Actualiza DB e interfaz de Leaflet
    await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);
    refrescarPunto(detallePunto.uuid, nuevoEstado);
    
    setDetallePunto({ ...detallePunto, revision_planta: nuevoEstado });
  };

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
      {/* El mapa usa el 100% del contenedor */}
      <Box ref={mapDivRef} sx={{ width: '100%', height: '100%' }} />

      {/* Sidebar Temporal que no "empuja" al mapa */}
      <Drawer
        anchor="right"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary"
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Detalle</Typography>
            <IconButton onClick={() => setIsSidebarOpen(false)}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          
          {detallePunto && (
            <Stack spacing={2}>
              <Typography variant="body2"><b>ID:</b> {detallePunto.uuid}</Typography>
              <Typography variant="body2">
                <b>Estado:</b> {detallePunto.revision_planta ? 'Revisado' : 'Pendiente'}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleUpdateStatus}
                color={detallePunto.revision_planta ? "secondary" : "primary"}
              >
                {detallePunto.revision_planta ? "Marcar Pendiente" : "Confirmar Revisión"}
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};