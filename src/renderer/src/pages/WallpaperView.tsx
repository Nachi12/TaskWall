import React, { useEffect, useState } from 'react';
import { useWallpaperStore } from '../stores/useWallpaperStore';
import { useTaskStore } from '../stores/useTaskStore';
import { WidgetRenderer } from '../widgets/WidgetRenderer';
import { Sliders, Power, X, Sparkles, MonitorPlay, Palette, Lock } from 'lucide-react';

export const WallpaperView: React.FC = () => {
  const {
    activePreset,
    presets,
    selectPreset,
    fetchActivePreset,
    deactivateDesktopMode,
    initListeners: initWallpaperListeners
  } = useWallpaperStore();

  const {
    fetchTasks,
    fetchPendingTasks,
    fetchCalendarSummary,
    initListeners: initTaskListeners
  } = useTaskStore();

  const [showMenu, setShowMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetchActivePreset();
    fetchTasks();
    fetchPendingTasks();
    fetchCalendarSummary();

    const unsubWallpaper = initWallpaperListeners();
    const unsubTasks = initTaskListeners();

    // Escape key listener to exit wallpaper mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.api?.openDashboardWindow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubWallpaper();
      unsubTasks();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenStudio = () => {
    window.api?.openDashboardWindow();
  };

  const handleExitWallpaper = async () => {
    if (window.api?.openDashboardWindow) {
      await window.api.openDashboardWindow();
    }
    if (window.api?.deactivateDesktopMode) {
      await window.api.deactivateDesktopMode();
    }
  };

  const handleQuitApp = async () => {
    if (window.api?.quitApp) {
      await window.api.quitApp();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const backgroundStyle: React.CSSProperties = {
    background: activePreset?.background_value || '#0B1020',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <div
      style={backgroundStyle}
      onContextMenu={handleContextMenu}
      onClick={() => setContextMenuPos(null)}
      className="select-none font-sans relative"
    >
      {/* Sleek Floating Desktop Quick-Control Pill */}
      <div className="fixed top-4 right-6 z-50 flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-full glass-panel border border-white/10 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleOpenStudio}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-slate-100 hover:text-white transition-all"
            title="Open DayCanvas Studio (Esc)"
          >
            <Sliders className="w-3.5 h-3.5 text-canvas-accent" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            onClick={handleExitWallpaper}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-all border border-amber-500/30"
            title="Pause Desktop Wallpaper Mode"
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>

          <button
            type="button"
            onClick={handleQuitApp}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-all border border-rose-500/30"
            title="Quit DayCanvas Completely"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Quit</span>
          </button>
        </div>
      </div>

      {/* Right-click Context Menu */}
      {contextMenuPos && (
        <div
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          className="fixed z-50 w-52 rounded-xl glass-panel border border-white/15 shadow-2xl p-1.5 text-xs text-white space-y-1 animate-in fade-in zoom-in-95 duration-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-canvas-subtle uppercase tracking-wider">
            DayCanvas Wallpaper
          </div>
          <button
            type="button"
            onClick={() => {
              handleOpenStudio();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left"
          >
            <Sliders className="w-3.5 h-3.5 text-canvas-accent" />
            <span>Open Studio (Esc)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleExitWallpaper();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 text-amber-300 transition-colors text-left"
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>Pause Live Wallpaper</span>
          </button>

          <div className="h-px bg-white/10 my-1" />

          <div className="px-2.5 py-0.5 text-[10px] text-canvas-subtle">Theme Presets</div>
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                selectPreset(p.id);
                setContextMenuPos(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-left ${
                activePreset?.id === p.id ? 'bg-canvas-accent/20 text-canvas-accent font-bold' : 'hover:bg-white/10'
              }`}
            >
              <span>{p.name}</span>
            </button>
          ))}

          <div className="h-px bg-white/10 my-1" />

          <button
            type="button"
            onClick={() => {
              handleQuitApp();
              setContextMenuPos(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 transition-colors text-left font-medium"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Quit DayCanvas</span>
          </button>
        </div>
      )}

      {/* Render Active Widgets */}
      {activePreset?.widgets.map(widget => (
        <WidgetRenderer
          key={widget.id}
          widget={widget}
          theme={activePreset.theme}
        />
      ))}
    </div>
  );
};
