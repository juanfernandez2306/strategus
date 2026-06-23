import { useRef, useCallback } from "react";
import { useSistemaStore } from "../../hooks/useSistemaStore";

import type { 
    GpsSensorData,
    HeadingSensorData,
    CoordenadasGeograficas 
} from "../sensorTypes";

import { 
    haSuperadoUmbralPosicion,
    haSuperadoUmbralHeading,
    lerpAnguloAlfaRaw
 } from "./utilsLocation";


interface syncReferenciasSaludSensores {
    statusGpsOkRef: React.RefObject<boolean>;
    statusHeadingOkRef: React.RefObject<boolean>;
}

export const useUpdateLocation = ({
    statusGpsOkRef,
    statusHeadingOkRef
}: syncReferenciasSaludSensores)  => {

    // 1 metros / 111111.11 metros
    const UMBRAL_TOLERANCIA = 0.000009;

    const primerVueloCompletado = useRef<boolean>(false);

    const ultimaPosicionRef = useRef<CoordenadasGeograficas>({
       lng: 0,
       lat: 0 
    })

    const esPrecisoGpsRef = useRef<boolean>(false);

    //variables del heading

    const ultimoHeadingSuavizadoRef = useRef<number | null>(null);

    const {
        setPosicionGPS,
        setEsPrecisoGPS,
        setHeadingAlfa,
        setPrimerVueloCompletado,
     } = useSistemaStore();

    const procesarPosicionGPS = useCallback((dataGPS: GpsSensorData) => {

        if (!statusGpsOkRef.current){
            
            if (primerVueloCompletado.current) {

                primerVueloCompletado.current = false;
                setPrimerVueloCompletado(false);

            }
            
            return;
        };

        let { lng, lat, accuracy } = dataGPS;

        if (typeof lng !== 'number' || typeof lat !== 'number' || typeof accuracy !== 'number') return;
        
        lng = +lng.toFixed(5);
        lat = +lat.toFixed(5);

        if (!primerVueloCompletado.current){

            primerVueloCompletado.current = true;

            ultimaPosicionRef.current = {
                lng: lng,
                lat: lat
            }
            
            setPosicionGPS(ultimaPosicionRef.current);
            setPrimerVueloCompletado(primerVueloCompletado.current);

        }

        const haSuperadoUmbralPosicionactual = haSuperadoUmbralPosicion(
            ultimaPosicionRef.current,
            {lng: lng, lat: lat},
            UMBRAL_TOLERANCIA
        )

        if (haSuperadoUmbralPosicionactual){
            ultimaPosicionRef.current = {lng: lng, lat: lat}
            setPosicionGPS(ultimaPosicionRef.current);
        }

        const esPrecisoGps = accuracy < 20;

        if (esPrecisoGpsRef.current !== esPrecisoGps){
            esPrecisoGpsRef.current = esPrecisoGps;
            setEsPrecisoGPS(esPrecisoGpsRef.current)
        }

    }, [setPosicionGPS, setEsPrecisoGPS, setPrimerVueloCompletado]);

    const procesarHeading = useCallback((dataHeading: HeadingSensorData) => {

        const headingRaw = dataHeading.heading;

        if (typeof headingRaw !== 'number'){

            if (ultimoHeadingSuavizadoRef.current !== null) {
                ultimoHeadingSuavizadoRef.current = null;
                setHeadingAlfa(null);
            }

            return;
        };

        if(!statusHeadingOkRef.current) return;


        if (ultimoHeadingSuavizadoRef.current === null){
            ultimoHeadingSuavizadoRef.current = headingRaw

            setHeadingAlfa(
                Math.round(ultimoHeadingSuavizadoRef.current)
            );

            return;
            
        }

        const haSuperadoUmbralHeadingActual = haSuperadoUmbralHeading(
            ultimoHeadingSuavizadoRef.current,
            headingRaw
        );

        if (haSuperadoUmbralHeadingActual){
            
            const headingSuviazado = lerpAnguloAlfaRaw(
                ultimoHeadingSuavizadoRef.current,
                headingRaw,
                0.35
            );
            
            ultimoHeadingSuavizadoRef.current = headingSuviazado;
            setHeadingAlfa(
                Math.round(ultimoHeadingSuavizadoRef.current)
            );
        }

    }, [setHeadingAlfa]);

    return {
        procesarPosicionGPS,
        procesarHeading
    }

}