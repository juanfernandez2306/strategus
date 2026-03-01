import L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    // Definimos la clase para el control de ubicación
    class Locate extends Control {
      constructor(options?: any);
      start(): void;
      stop(): void;
    }
  }

  namespace control {
    /**
     * Extiende L.control para incluir el método locate
     */
    function locate(options?: any): Control.Locate;
  }
}