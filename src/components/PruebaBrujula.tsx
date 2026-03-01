import { useRef } from 'react';
import { Box, Button, Slider, Typography, Stack } from '@mui/material';
import Compass, { type CompassHandle } from './Compass';

export const TestCompass = () => {
  // 1. La referencia sigue siendo la clave
  const compassRef = useRef<CompassHandle>(null);

  // Función para probar la actualización de distancia directamente
  const handleUpdateDistanceDirect = (val: number) => {
    // La interfaz CompassHandle ahora incluye updateDistance
    compassRef.current?.updateDistance(val);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500, margin: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>Panel de Pruebas</Typography>
      
      {/* El componente Compass recibe la ref para control externo */}
      <Compass ref={compassRef} size={300} />

      <Stack spacing={4} sx={{ mt: 5 }}>
        
        {/* PRUEBA DE ROTACIÓN */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Control de Aguja (Directo al SVG)
          </Typography>
          <Slider 
            min={0} 
            max={360} 
            defaultValue={0}
            // Actualizamos el estilo transform sin re-render
            onChange={(_, val) => compassRef.current?.updateAngle(val as number)}
          />
        </Box>

        {/* PRUEBA DE DISTANCIA */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Control de Distancia (Directo al textContent)
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={() => handleUpdateDistanceDirect(150)}>
              Set 150m
            </Button>
            <Button variant="contained" onClick={() => handleUpdateDistanceDirect(10)}>
              Set 10m
            </Button>
            <Button variant="outlined" onClick={() => handleUpdateDistanceDirect(0)}>
              Reset
            </Button>
          </Stack>
        </Box>

      </Stack>
    </Box>
  );
};