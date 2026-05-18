import type { CoordenadasGeograficas } from '../sensorTypes';

export const haSuperadoUmbralPosicion = (

    pos1: CoordenadasGeograficas, 
    pos2: CoordenadasGeograficas, 
    umbral: number) => {

    const diffLng = pos1.lng - pos2.lng;

    const diffLat = pos1.lat - pos2.lat;

    return (
        (diffLat * diffLat) + (diffLng * diffLng) > 
        (umbral * umbral)
    );

};

export const haSuperadoUmbralHeading = (
    oldHeading: number, 
    newHeading: number): boolean => {
    
        let diferencia = Math.abs(oldHeading - newHeading);

        if (diferencia > 180) {
            diferencia = 360 - diferencia;
        }

        return (diferencia > 6);

}

// Añadir en utilsLocation.ts
export const lerpAnguloAlfaRaw = (
    ultimo_valor_registrado: number, 
    valor_actual_medido: number, 
    alfa: number): number => {
    // Calculamos la diferencia mínima en un círculo de 360 grados
    let diferencia = ((valor_actual_medido - ultimo_valor_registrado + 180) % 360) - 180;
    if (diferencia < -180) diferencia += 360;

    // Retornamos el valor interpolado normalizado entre 0 y 360
    return (ultimo_valor_registrado + diferencia * alfa + 360) % 360;
};