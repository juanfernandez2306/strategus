import { useState, useRef } from 'react';
import FormBaseLayout from '../../components/FormLayoutBase';
import IconFileJsonMerge from '../../components_svg/IconFileJsonMerge';
import style from "../../components/FormLayoutBase.module.css";
import { useImportarManager } from './useImportarManager';

const ImportarGeojson = () => {
    const [fileList, setFileList] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { procesarArchivos, isProcessing } = useImportarManager();

    const handleExecute = async () => {
        const mensaje = await procesarArchivos(fileList);
        
        // Reset de la UI
        setFileList(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        return mensaje;
    };

    return (
       <FormBaseLayout
        titulo="Sincronizar GeoJSON"
        buttonText={isProcessing ? "Escribiendo..." : "Importar a base de datos"}
        iconoCustom={<IconFileJsonMerge size={120}/>}
        onExecute={handleExecute}
        disabled={isProcessing || !fileList}
       >
        <aside className={style.groupInput}>
            <label htmlFor="import_geojson">Cargar archivos de GeoJSON</label>
            <input
                ref={fileInputRef}
                id="import_geojson"
                type="file"
                multiple
                accept=".geojson,.json"
                onChange={(e) => setFileList(e.target.files)}
            />
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
                {fileList 
                    ? `${fileList.length} archivo(s) seleccionados` 
                    : "Puedes seleccionar varios archivos .geojson"}
            </p>
        </aside>
       </FormBaseLayout>
    );
};

export default ImportarGeojson;