interface IconProps {
  size?: number;
  colorPunta?: string; // Color para la punta (Norte)
  colorBase?: string;  // Color para el resto
}

const IconFileArrow = ({ 
  size = 180, 
  colorPunta = "#d32f2f", // Rojo por defecto para identificar el Norte
  colorBase = "#000" 
}: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 192 192"
    style={{ transition: 'transform 0.1s linear' }}
  >
    <g strokeLinejoin="round" strokeWidth={12}>
      {/* Cuerpo de la flecha - Ahora apuntando hacia arriba */}
      <path
        stroke={colorBase}
        strokeLinecap="round"
        d="M96 25 L150 140 L96 115 L42 140 Z" 
      />
      {/* Línea central o "punta" coloreada para identificar dirección */}
      <path 
        stroke={colorPunta} 
        strokeLinecap="round" 
        d="M96 25 V115" 
      />
    </g>
  </svg>
);

export default IconFileArrow;