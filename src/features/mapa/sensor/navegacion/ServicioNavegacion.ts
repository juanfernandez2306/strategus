// features/mapa/sensor/navegacion/ServicioNavegacion.ts
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import bearing from '@turf/bearing';
import type { CoordenadasGeograficas } from '../sensorTypes';

export class ServicioNavegacion {
  private readonly GPS_NOISE_THRESHOLD = 2; 
  private currentLerpAngle: number = 0;
  private alphaAngle: number = 0.15;
  private lastStoredDistance: number = 0;
  private alphaDistance: number = 0.25;

  private esPrimerPulso: boolean = true;

  private currentHeading: number = 0; 
  private readonly suavizadoOrientacion = 0.2;

  /**
   * Algoritmo LERP corregido para evitar saltos bruscos en el paso por el Norte (0°/360°)
   */
  private lerpAngulo(actual: number, objetivo: number, alpha: number): number {
    let diferencia = (objetivo - actual) % 360;
    if (diferencia > 180) diferencia -= 360;
    if (diferencia < -180) diferencia += 360;
    return actual + (diferencia * alpha);
  }

  /**
   * Procesa la ráfaga de datos y calcula los valores filtrados de salida
   */
  public calcularNavegacion(
    coordenadasUsuario: CoordenadasGeograficas, 
    coordenadasDestino: CoordenadasGeograficas, 
    heading: number
  ) {
    const from = point([coordenadasUsuario.lng, coordenadasUsuario.lat]);
    const to = point([coordenadasDestino.lng, coordenadasDestino.lat]);

    // 1. Distancia mediante Turf
    const rawDistance = distance(from, to, { units: 'meters' });

    if (this.esPrimerPulso){
      this.lastStoredDistance = rawDistance;
      this.esPrimerPulso = false;
    }else{
      // 2. Filtro de estabilidad de distancia (Umbral de ruido)
      const diff = Math.abs(rawDistance - this.lastStoredDistance);
      if (diff > this.GPS_NOISE_THRESHOLD) {
        this.lastStoredDistance = this.lastStoredDistance + this.alphaDistance * (rawDistance - this.lastStoredDistance);
      }

    }

    // 3. Cálculo de rumbo base (Bearing)
    let rumboDestino = bearing(from, to);
    rumboDestino = (rumboDestino + 360) % 360;

    // 4. Ángulo relativo final de la aguja considerando el heading del móvil
    const targetAngle = (rumboDestino - heading + 360) % 360;

    // 5. Aplicación del LERP angular blindado
    this.currentLerpAngle = this.lerpAngulo(this.currentLerpAngle, targetAngle, this.alphaAngle);

    return {
      distanciaFiltrada: Math.round(this.lastStoredDistance),
      anguloFiltrado: Math.round(this.currentLerpAngle),
      proximidadModo: this.lastStoredDistance <= 12
    };
  }

  public procesarHeading(directo: number): number {
    
    let diff = directo - this.currentHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    this.currentHeading += this.suavizadoOrientacion * diff;
    return (this.currentHeading + 360) % 360;
  }

  public resetearNavegacion() {
    this.esPrimerPulso = true;
    this.currentLerpAngle = 0;
    this.lastStoredDistance = 0;
  }
}