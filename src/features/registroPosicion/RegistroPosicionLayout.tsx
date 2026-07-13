import { useState } from "react";
import FormBaseLayout from "../../components/FormBaseLayout";
import styleLocal from './RegistroPosicionLayout.module.css';
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
            onExecute={handleSubmit}
            onSuccess={handleSuccess}>
            
            <section className={styleLocal.contenedorLogo}>
                <figure>
                    <IconStrategusAloeus height={150} width={120} />
                </figure>
                <aside className={styleLocal.contadorContenedor}>
                    <p className={styleLocal.contadorEtiqueta}>
                        Puntos registrados hoy
                    </p>
                    <h2 className={styleLocal.contadorNumero}>
                        {conteoDiario}
                    </h2>
                </aside>
            </section>

            <aside className={styleLocal.groupInput}>
                <label
                    className={styleLocal.label} 
                    htmlFor="galeria">N° de Galería</label>
                <input 
                    className={styleLocal.input}
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