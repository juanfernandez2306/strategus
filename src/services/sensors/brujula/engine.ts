// engine.ts
export const watchOrientacionRaw = (
    onHeadingUpdate: (data: { heading: number | null }) => void
) => {
    
    const handleOrientation = (e: any) => {
        // 1. Si es iOS, el valor ya es horario y apunta al Norte. Lo usamos directo.
        if (e.webkitCompassHeading !== undefined) {
            onHeadingUpdate({
                heading: e.webkitCompassHeading,
            });
            return;
        }

        // 2. Si es Android / Estándar W3C (e.alpha existe y no es null)
        if (e.alpha !== null && e.alpha !== undefined) {
            // Aplicamos tu lógica exacta: Invertir el sentido antihorario a horario
            let headingHorario = 360 - e.alpha;

            // Aseguramos que el valor permanezca en el rango cerrado [0, 360)
            if (headingHorario >= 360) headingHorario -= 360;
            if (headingHorario < 0) headingHorario += 360;

            onHeadingUpdate({
                heading: headingHorario,
            });
            return;
        }

        // Si no hay sensores disponibles
        onHeadingUpdate({ heading: null });
    };

    // Mantenemos tus listeners imperativos de alto rendimiento
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
    };
};