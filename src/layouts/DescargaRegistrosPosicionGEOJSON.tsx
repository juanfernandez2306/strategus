// src/components/DownloadFileGeoJSON.tsx
import { useState } from "react";
import FormBaseLayout from "../components/FormLayoutBase";
import style from '../components/FormLayoutBase.module.css';
import IconFileGEOJSON from "../components_svg/IconFileGEOJSON";
import { useDescargarGeoJSON } from "../hooks/useDescargarGEOJSON";

const DescargarRegistrosPosicionGEOJSON = () => {
    const [fecha, setFecha] = useState<string>("");
    const { generarYDescargar } = useDescargarGeoJSON();

    const handleExecute = async () => {
        if (!fecha) throw new Error("Debe seleccionar una fecha");
        
        const resultado = await generarYDescargar(fecha);
        setFecha(""); // Limpiar tras éxito
        return resultado;
    };

    return (
        <FormBaseLayout
            titulo="Exportar Datos a QFIELD"
            buttonText="Descargar GeoJSON"
            iconoCustom={<IconFileGEOJSON size={150}/>} // Aquí iría tu icono de mapa
            onExecute={handleExecute}
        >
            <aside className={style.groupInput}>
                <label htmlFor="fecha">Fecha de consulta</label>
                <input 
                    id="fecha" 
                    type="date"  
                    required 
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                />
            </aside>
        </FormBaseLayout>
    );
};

export default DescargarRegistrosPosicionGEOJSON;