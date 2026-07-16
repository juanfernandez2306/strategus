import styles from './TarjetaRegistro.module.css';
import { useSistemaStore } from '../mapa/hooks/useSistemaStore'; 

// 1. Definimos las propiedades aceptando 'undefined' de forma nativa
interface TarjetaRegistroProps {
  distanciaMetros?: number; // Equivalente a: number | undefined
  sincronizacion?: boolean;
  onNavegar: () => void;
}

export const TarjetaRegistro = ({
  distanciaMetros,
  sincronizacion,
  onNavegar
}: TarjetaRegistroProps) => {

  // Consumimos el estado global del sistema
  const sistemaListo = useSistemaStore((state) => state.sistemaListo);
  
  // Condición lógica 1: ¿Tenemos una distancia válida para mostrar?
  const tieneDistanciaValida = sistemaListo && distanciaMetros !== undefined && distanciaMetros > 0;

  // Condición lógica 2: El botón se bloquea si el sistema no está listo O si la distancia aún es undefined
  const navegarBloqueado = !sistemaListo || distanciaMetros === undefined;

  const handleNavegar = (e: React.MouseEvent) => {
    
    // Evitamos cualquier acción si la navegación está bloqueada
    if (navegarBloqueado) {
      e.stopPropagation();
      return;
    }

    onNavegar();
  };

  return (
    <article className={styles.tarjeta}>
      {/* Encabezado con el estado de sincronización */}
      <div className={styles.encabezado}>
        <span className={`${styles.statusBadge} ${sincronizacion ? styles.sincronizado : styles.pendiente}`}>
          Almacenamiento {sincronizacion ? 'Sincronizado' : 'Local'}
        </span>
      </div>

      {/* Cuerpo con la distancia calculada en tiempo real */}
      <div className={styles.cuerpo}>
        <div className={styles.datoGrupo}>
          <p className={styles.etiqueta}>DISTANCIA ESTIMADA</p>
          <p className={styles.valorDestacado}>
            {tieneDistanciaValida
              ? `${distanciaMetros.toFixed(1)} metros` 
              : 'Calculando...'}
          </p>
        </div>
      </div>

      {/* Botón de acción masivo para móviles */}
      <footer className={styles.pieCard}>
        <button 
          type="button" 
          className={`${styles.botonNavegar} ${navegarBloqueado ? styles.botonDeshabilitado : ''}`}
          onClick={handleNavegar}
          disabled={navegarBloqueado} // Deshabilitado nativamente en HTML/React
        >
          <span>Navegar al punto</span>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
      </footer>
    </article>
  );
};

export default TarjetaRegistro;