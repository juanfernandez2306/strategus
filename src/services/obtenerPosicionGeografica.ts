import { type RegistroPosicion } from "./tipos";
import dayjs from "dayjs";


const obtenerRegistroPosicionGeografica = (galeria: number): Promise<Partial<RegistroPosicion>> => {
    return new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const { latitude, longitude, accuracy } = posicion.coords;
                const ahora = dayjs();

                if (accuracy > 20) {
                    return reject(new Error(`Precisión insuficiente (${accuracy.toFixed(1)}m). Intente, nuevamente.`));
                }
                
                // Formateamos fecha y hora actual
                const fecha = ahora.format("YYYY-MM-DD");
                const hora = ahora.format("HH:mm:ss");

                resolve({
                    latitud: latitude,
                    longitud: longitude,
                    precision: accuracy,
                    fecha,
                    hora,
                    galeria,
                    sincronizacion: false,
                    revision_planta: false,
                    fecha_revision: null,
                    hora_revision: null
                });
            },
            (error: GeolocationPositionError) => {
                if (error.code === error.TIMEOUT) {
                    reject(new Error("Tiempo de espera agotado al obtener la posición"));
                } else if (error.code === error.PERMISSION_DENIED) {
                    reject(new Error("El usuario no dio permiso de geolocalización"));
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    reject(new Error("No se pudo determinar la posición"));
                } else {
                    reject(error);
                }
            },
            { timeout: 5000, enableHighAccuracy: true, maximumAge: 0 }
        );
    });
};

export default obtenerRegistroPosicionGeografica;