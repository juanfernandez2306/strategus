export const watchOrientacionRaw = (onHeadingUpdate: (heading: number) => void) => {
    
    const handleOrientation = (e: any) => {
        const directo = e.webkitCompassHeading || e.alpha;

        if (directo !== undefined && directo !== null) {
            onHeadingUpdate(directo);
        }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
    };
};