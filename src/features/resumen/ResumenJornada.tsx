// src/layouts/ResumenJornadaLayout.tsx
import FormBaseLayout from "../../components/FormLayoutBase";
import { useResumenJornada } from "./useResumenJornada";
import { Box, Typography, Divider } from "@mui/material";
import style from "../../components/FormLayoutBase.module.css";
// Importa un icono adecuado de tu carpeta de SVGs
import IconStrategusAloeus from "../../components_svg/IconStrategusAloeus"; 

const ResumenJornadaLayout = () => {
  const { registrados, revisados, sumaGalerias, refrescar } = useResumenJornada();

  // onExecute requiere una promesa que retorne string para el modal de éxito
  const handleRefrescar = async () => {
    return await refrescar();
  };

  return (
    <FormBaseLayout
      titulo="Resumen de Operación"
      buttonText="Actualizar Indicadores"
      iconoCustom={<IconStrategusAloeus size={100} />}
      onExecute={handleRefrescar}
    >
      <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
        
        {/* Fila de Conteos Principales */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'gray', fontWeight: 'bold' }}>MARCADOS</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{registrados}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'gray', fontWeight: 'bold' }}>REVISADOS</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{revisados}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* El "Corazón" del requerimiento: Sum(Galería) */}
        <Box className={style.groupInput} sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(253, 251, 0, 0.05)', borderRadius: '10px', border: '1px dashed var(--color-primario)' }}>
          <Typography variant="caption" sx={{ color: 'var(--color-primario)', letterSpacing: 1.5, fontWeight: 'bold' }}>
            VALOR ACUMULADO GALERÍAS
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'black', color: 'var(--color-primario)' }}>
            {sumaGalerias}
          </Typography>
        </Box>

      </Box>
    </FormBaseLayout>
  );
};

export default ResumenJornadaLayout;