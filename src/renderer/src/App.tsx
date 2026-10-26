import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { WallpaperView } from './pages/WallpaperView';

export const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'wallpaper'>(() => {
    return window.location.hash.includes('wallpaper') ? 'wallpaper' : 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash.includes('wallpaper') ? 'wallpaper' : 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (view === 'wallpaper') {
    return <WallpaperView />;
  }

  return <Dashboard />;
};

export default App;
