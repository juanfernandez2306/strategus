import FormBaseLayout from "../../components/FormBaseLayout";
import IconDeleteDB from "../../components_svg/IconDeleteDB";
import { limpiarRegistrosPosiciones } from "../../services/indexedbd/palmaActions"; 

/**
 * Componente de interfaz para el borrado total de la base de datos local.
 * Utiliza un layout base que ya maneja estados de carga y modales de confirmación.
 */
const EliminarRegistros = () => {

    const handleSubmit = async (): Promise<string> => {
        try {
            // Esta función ya incluye un window.confirm internamente según palmaActions.ts
            return await limpiarRegistrosPosiciones();
        } catch (error: any) {
            // Si el usuario cancela o hay un error, lanzamos para que el FormBaseLayout lo capture
            throw new Error(error.message || "Error al eliminar los registros");
        }
    };

    return (
        <FormBaseLayout
            titulo="Eliminar registros de la base de datos"
            buttonText="Borrar todos los datos"
            onExecute={handleSubmit}
        >
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <IconDeleteDB size={180} />
                <p style={{ color: 'var(--color-texto-secundario)', margin: 0 }}>
                    Esta acción es <strong>irreversible</strong>. Se borrarán permanentemente todos los puntos 
                    almacenados en este dispositivo que no hayan sido exportados.
                </p>
            </div>
        </FormBaseLayout>
    );
};

export default EliminarRegistros;