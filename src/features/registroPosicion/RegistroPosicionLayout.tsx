import { useState } from "react";
import FormBaseLayout from "../../components/FormLayoutBase";
import styleLayoutBase from '../../components/FormLayoutBase.module.css';
import styleLocal from './RegistroPosicionLayout.module.css'; // 1. Importamos el nuevo CSS Module
import IconStrategusAloeus from "../../components_svg/IconStrategusAloeus";
import { useRegistroPosicion } from "./useRegistroPosicion";

const RegistroPosicionLayout = () => {
    const [galeria, setGaleria] = useState<string>("");
    const { registrarPosicionActual, conteoDiario } = useRegistroPosicion();

    const handleSubmit = async (): Promise<string> => {
        const numeroGaleria = parseInt(galeria);

        if (isNaN(numeroGaleria) || galeria.trim() === "") {
            throw new Error("Por favor, ingrese un número de galería válido.");
        }

        if (numeroGaleria < 1 || numeroGaleria > 10) {
            throw new Error("El número de galería debe estar entre 1 y 10.");
        }

        const nuevoUuid = crypto.randomUUID();
        
        return await registrarPosicionActual(numeroGaleria, nuevoUuid);
    };

    const handleSuccess = () => {
        setGaleria("");
    };

    return (
        <FormBaseLayout
            titulo="Registro GPS"
            buttonText="Grabar Punto"
            iconoCustom={<IconStrategusAloeus size={150} />}
            onExecute={handleSubmit}
            onSuccess={handleSuccess}
        >
            {/* 2. Reemplazamos Box y Typography por etiquetas HTML nativas con CSS Modules */}
            <div className={styleLocal.contadorContenedor}>
                <p className={styleLocal.contadorEtiqueta}>
                    Puntos registrados hoy
                </p>
                <h2 className={styleLocal.contadorNumero}>
                    {conteoDiario}
                </h2>
            </div>

            <aside className={styleLayoutBase.groupInput}>
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