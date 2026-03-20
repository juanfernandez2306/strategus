// src/components/UnificarArchivosGEOJSON.tsx

import { useState, useRef } from 'react';
import FormBaseLayout from '../components/FormLayoutBase';
import IconFileJsonMerge from '../components_svg/IconFileJsonMerge';
import style from "../components/FormLayoutBase.module.css";


import { useImportarGeoJSON } from '../hooks/useUnificarGuardarIndexedbd';

const UnirYguardarArchivosGeoJSON = () => {
    const [fileList, setFileList] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // CORRECCIÓN 2: Desestructuración correcta. 
    // Extraemos la función 'unificarYDescargar' del hook 'useUnificarGeoJSON'
    const { importarABaseDeDatos } = useImportarGeoJSON(); 

    const handleSubmit = async (): Promise<string> => {
        
        const mensaje = await importarABaseDeDatos(fileList);
        
        setFileList(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        return mensaje;
    };

    return (
       <FormBaseLayout
        titulo="Guardar Archivos en BD"
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

export default UnirYguardarArchivosGeoJSON;