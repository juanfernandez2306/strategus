import FormBaseLayout from "../../components/FormLayoutBase";
import IconFileGEOJSON from "../../components_svg/IconFileGEOJSON";
import { useExportarTodo } from "./useExportar";

const ExportarGeoJSON = () => {
    const { ejecutarExportacionTotal } = useExportarTodo();

    return (
        <FormBaseLayout
            titulo="Copia de Seguridad Completa"
            buttonText="Exportar Todo (GeoJSON)"
            iconoCustom={<IconFileGEOJSON size={150}/>}
            onExecute={ejecutarExportacionTotal} // Pasamos la función directamente
        >
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ color: 'var(--color-texto-secundario)', margin: 0 }}>
                    Esta acción generará un archivo con <strong>todos los puntos</strong> registrados en este dispositivo.
                </p>
                <small style={{ display: 'block', marginTop: '10px', opacity: 0.7 }}>
                    Ideal para importar en QGIS o QField.
                </small>
            </div>
        </FormBaseLayout>
    );
};

export default ExportarGeoJSON;