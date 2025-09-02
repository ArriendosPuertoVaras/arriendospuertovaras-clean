import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top cuando cambia la ruta
    window.scrollTo(0, 0);
  }, [pathname]);

  // Este componente no renderiza nada visible
  return null;
}