export const watchOrientacionRaw = (onHeadingUpdate: (heading: number | null) => void) => {
    

    const handleOrientation = (e: any) => {
        const directo = e.webkitCompassHeading || e.alpha;
        onHeadingUpdate(directo); 

    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
    };
};