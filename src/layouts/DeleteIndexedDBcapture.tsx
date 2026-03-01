import FormBaseLayout from "../components/FormLayoutBase";
import IconDeleteDB from "../components_svg/IconDeleteDB";
import limpiarRegistrosPosiciones from "../services/limpiarBD";


const DeleteIndexeDBcapture = () => {

    const handleSubmit = async () => {

        await limpiarRegistrosPosiciones();

        return "Registro eliminados con exito";
    };

    return (
        <FormBaseLayout
            titulo = "Eliminar registro de la base de datos"
            buttonText = "Borrar datos"
            iconoCustom = {<IconDeleteDB size={180} />}
            onExecute={handleSubmit}
        />
    );

};

export default DeleteIndexeDBcapture;