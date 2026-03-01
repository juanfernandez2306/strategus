import { Box, Typography, Divider } from "@mui/material";
import FormBaseLayout from "../components/FormLayoutBase";
//import IconFileArrow from "../components_svg/IconFileArrow";
import IconFileArrowOther from "../components_svg/IconFileArrowOther";

const BrujulaRegistroPosicion = () => {
  const distanciaEstatica = 1999; 
  const rumboEstatico = 45;      

  const handleGuardar = async () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve("Punto verificado correctamente"), 1500);
    });
  };

  return (
    <FormBaseLayout
      titulo="Guía de Navegación"
      buttonText="Confirmar Ubicación"
      onExecute={handleGuardar}
      iconoCustom={
        <Box sx={{ 
          transform: `rotate(${rumboEstatico}deg)`, 
          display: 'flex', 
          justifyContent: 'center',
          transition: 'transform 0.3s ease-out' // Suaviza el giro estático
        }}>
          <IconFileArrowOther size={160} />
        </Box>
      }
    >
      {/* Contenedor principal de datos */}
      <Box sx={{ textAlign: "center", width: '100%' }}>
        
        {/* Prioridad 1: Distancia */}
        <Typography variant="h2" sx={{ fontWeight: "bold", color: "primary.main", mb: 0 }}>
          {distanciaEstatica}m
        </Typography>
        <Typography variant="overline" sx={{ display: 'block', mt: -1, color: "text.secondary" }}>
          Distancia al objetivo
        </Typography>

        <Divider sx={{ my: 2, mx: 4 }} />

        {/* Prioridad 2: Rumbo (Dato técnico) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: "medium", color: "text.primary" }}>
                {rumboEstatico}°
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Rumbo
            </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
          Mantén la flecha roja hacia arriba para avanzar
        </Typography>
      </Box>
    </FormBaseLayout>
  );
};

export default BrujulaRegistroPosicion;