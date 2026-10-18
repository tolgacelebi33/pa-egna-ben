import { useEffect, useState } from 'react';

// Serverrenderingen använder startvärdet. Mobil först: figurer startar i smal vy.
export function useMediaQuery(fraga, start = false) {
  const [traff, setTraff] = useState(start);
  useEffect(() => {
    const mq = window.matchMedia(fraga);
    const uppdatera = () => setTraff(mq.matches);
    uppdatera();
    mq.addEventListener('change', uppdatera);
    return () => mq.removeEventListener('change', uppdatera);
  }, [fraga]);
  return traff;
}
