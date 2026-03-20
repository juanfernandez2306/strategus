// Importaciones específicas para minimizar el bundle de la PWA
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import bearing from '@turf/bearing';

class NavigationService {
  // Solo filtramos el ruido físico del GPS (saltos menores a 5m)
  private readonly GPS_NOISE_THRESHOLD = 5; 
  
  private currentLerpAngle: number = 0;
  private alphaAngle: number = 0.15;
  
  private lastStoredDistance: number = 0;
  private alphaDistance: number = 0.25;

  calcularNav(
    userLat: number, userLon: number, 
    destLat: number, destLon: number, 
    telefonoHeading: number
  ) {
    const from = point([userLon, userLat]);
    const to = point([destLon, destLat]);

    // 1. Distancia real calculada por Turf
    const rawDistance = distance(from, to, { units: 'meters' });

    // 2. Filtro de Estabilidad (No mentimos, solo suavizamos el jitter)
    const diff = Math.abs(rawDistance - this.lastStoredDistance);
    
    // Si el cambio es mayor a 5m, es un movimiento real, no ruido.
    if (diff > this.GPS_NOISE_THRESHOLD) {
      this.lastStoredDistance = this.lastStoredDistance + this.alphaDistance * (rawDistance - this.lastStoredDistance);
    } 
    // Si es menor a 5m, mantenemos el último valor para evitar que el número baile

    // 3. Rumbo (Bearing)
    let rumboDestino = bearing(from, to);
    rumboDestino = (rumboDestino + 360) % 360;

    // 4. Aguja (Camino más corto)
    const targetAngle = (rumboDestino - telefonoHeading + 360) % 360;
    let delta = targetAngle - (this.currentLerpAngle % 360);

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    this.currentLerpAngle += delta * this.alphaAngle;

    return {
      // Devolvemos el valor redondeado para que sea legible
      distancia: Math.round(this.lastStoredDistance),
      anguloAguja: this.currentLerpAngle
    };
  }

  resetFilters() {
    this.lastStoredDistance = 0;
    // El ángulo no se resetea para que la aguja no salte al cambiar de objetivo
  }
}

export const navService = new NavigationService();