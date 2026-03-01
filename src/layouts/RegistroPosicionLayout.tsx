import { useState } from "react";
import FormBaseLayout from "../components/FormLayoutBase";
import style from '../components/FormLayoutBase.module.css';
import IconStrategusAloeus from "../components_svg/IconStrategusAloeus";
import { useRegistroPosicion } from "../hooks/useRegistroPosicion";
import { Typography, Box } from "@mui/material";

const RegistroPosicionLayout = () => {
    const [galeria, setGaleria] = useState<string>("");
    const { registrarPosicionActual, conteoDiario } = useRegistroPosicion();

    // Esta función debe retornar una Promesa de string para que FormBaseLayout la maneje
    const handleSubmit = async (): Promise<string> => {
        const numeroGaleria = parseInt(galeria);

        // Validación estilo Python: rápida y al grano
        if (isNaN(numeroGaleria) || galeria.trim() === "") {
            throw new Error("Por favor, ingrese un número de galería válido.");
        }

        if (numeroGaleria < 1 || numeroGaleria > 10) {
            throw new Error("El número de galería debe estar entre 1 y 10.");
        }

        const nuevoUuid = crypto.randomUUID();
        
        // Ejecutamos y retornamos el mensaje de éxito para el modal del Layout
        return await registrarPosicionActual(numeroGaleria, nuevoUuid);
    };

    // Función opcional para limpiar el input tras el éxito
    const handleSuccess = () => {
        setGaleria("");
    };

    return (
        <FormBaseLayout
            titulo="Registro de Posición Geográfica"
            buttonText="Grabar Punto"
            iconoCustom={<IconStrategusAloeus size={150} />}
            onExecute={handleSubmit}
            onSuccess={handleSuccess}
        >
            {/* Visualización del contador que pediste */}
            <Box sx={{ textAlign: 'center', mb: 0 }}>
                <Typography variant="body2" sx={{ color: 'gray', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Puntos registrados hoy
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'var(--color-primario)' }}>
                    {conteoDiario}
                </Typography>
            </Box>

            <aside className={style.groupInput}>
                <label htmlFor="galeria">N° de Galería</label>
                <input 
                    id="galeria" 
                    type="number" 
                    min={1} 
                    max={10} 
                    required 
                    value={galeria}
                    placeholder="Escriba un número (1-10)"
                    onChange={(e) => setGaleria(e.target.value)}
                />
            </aside>
        </FormBaseLayout>
    );
};

export default RegistroPosicionLayout;