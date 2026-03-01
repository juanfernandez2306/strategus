// src/components/UnificarArchivosGEOJSON.tsx

import { useState, useRef } from 'react';
import FormBaseLayout from '../components/FormLayoutBase';
import IconFileJsonMerge from '../components_svg/IconFileJsonMerge';
import style from "../components/FormLayoutBase.module.css";

// CORRECCIÓN 1: Importación nombrada (con llaves) ya que useUnificarGeoJSON no es un export default
import { useUnificarGeoJSON } from '../hooks/useUnificarGEOJSON'; 

const UnirArchivosGeoJSON = () => {
    const [fileList, setFileList] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CORRECCIÓN 2: Desestructuración correcta. 
    // Extraemos la función 'unificarYDescargar' del hook 'useUnificarGeoJSON'
    const { unificarYDescargar } = useUnificarGeoJSON(); 

    const handleSubmit = async (): Promise<string> => {
        // Ahora 'unificarYDescargar' ya está definido y se puede leer
        const mensaje = await unificarYDescargar(fileList);
        
        setFileList(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        return mensaje;
    };

    return (
       <FormBaseLayout
        titulo="Unificar Capas GeoJSON"
        buttonText="Unir Archivos"
        iconoCustom={<IconFileJsonMerge size={80}/>}
        onExecute={handleSubmit}
       >
        <aside className={style.groupInput}>
            <label htmlFor="archivos_geojson">Seleccionar capas (.geojson)</label>
            <input
                ref={fileInputRef}
                id="archivos_geojson"
                type="file"
                multiple
                accept=".geojson,.json"
                onChange={(e) => setFileList(e.target.files)}
            />
        </aside>
       </FormBaseLayout>
    );
};

export default UnirArchivosGeoJSON;