import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export function useHideSidebar() {
  const location = useLocation();
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    window.document.body.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
