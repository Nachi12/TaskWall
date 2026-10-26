import React, { useState, useEffect, useRef } from 'react';
import { useWallpaperStore } from '../stores/useWallpaperStore';
import { WidgetConfig, WallpaperPreset, WidgetType } from '@shared/types';
import { WidgetRenderer } from '../widgets/WidgetRenderer';
import { Save, Check, Sparkles, Layout, Palette, MonitorPlay, Undo, Plus } from 'lucide-react';

export const WallpaperEditor: React.FC = () => {
  const {
    activePreset,
    presets,
    selectPreset,
    updateActivePreset,
    activateDesktopMode,
    isDesktopActive,
    isActivating
  } = useWallpaperStore();

  const [currentWidgets, setCurrentWidgets] = useState<WidgetConfig[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activationFeedback, setActivationFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePreset) {
      setCurrentWidgets(activePreset.widgets);
    }
  }, [activePreset]);

  const handleToggleWidget = (type: WidgetType) => {
    const existing = currentWidgets.find(w => w.type === type);
    if (existing) {
      setCurrentWidgets(prev =>
        prev.map(w => (w.id === existing.id ? { ...w, visible: !w.visible } : w))
      );
    } else {
      const newWidget: WidgetConfig = {
        id: `widget-${type}-${Date.now()}`,
        type,
        position_x: 460,
        position_y: 200,
        width: type === 'timer' ? 460 : 380,
        height: type === 'timer' ? 220 : 130,
        visible: true,
        config: {}
      };
      setCurrentWidgets(prev => [...prev, newWidget]);
    }
  };

  // Handle Drag Start
  const handleMouseDown = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWidgetId(widgetId);
    setDraggingWidgetId(widgetId);

    const widget = currentWidgets.find(w => w.id === widgetId);
    if (!widget || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    setDragOffset({
      x: mouseX - widget.position_x,
      y: mouseY - widget.position_y
    });
  };

  // Handle Drag Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingWidgetId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const newX = Math.max(0, Math.min(1440 - 200, Math.round(mouseX - dragOffset.x)));
    const newY = Math.max(0, Math.min(900 - 100, Math.round(mouseY - dragOffset.y)));

    setCurrentWidgets(prev =>
      prev.map(w => (w.id === draggingWidgetId ? { ...w, position_x: newX, position_y: newY } : w))
    );
  };

  // Handle Drag End
  const handleMouseUp = () => {
    setDraggingWidgetId(null);
  };

  const handleSaveLayout = async () => {
    if (!activePreset) return;
    const updated: WallpaperPreset = {
      ...activePreset,
      widgets: currentWidgets
    };
    await updateActivePreset(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleApplyToDesktop = async () => {
    await handleSaveLayout();
    const res = await activateDesktopMode();
    setActivationFeedback(res.message);
    setTimeout(() => setActivationFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-canvas-bg text-white select-none">
      {/* Editor Control Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-canvas-border bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-canvas-accent" />
            <h1 className="text-base font-bold tracking-tight">Wallpaper Layout Studio</h1>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => selectPreset(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activePreset?.id === p.id
                    ? 'bg-canvas-accent text-slate-950 shadow-md'
                    : 'text-canvas-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveLayout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white transition-all border border-white/10"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-canvas-success" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved!' : 'Save Layout'}</span>
          </button>

          <button
            onClick={handleApplyToDesktop}
            disabled={isActivating}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-canvas-accent to-canvas-secondary hover:opacity-90 active:scale-95 text-xs font-bold text-slate-950 shadow-lg shadow-purple-500/25 transition-all"
          >
            <MonitorPlay className="w-4 h-4" />
            <span>{isActivating ? 'Activating...' : isDesktopActive ? 'Update Live Wallpaper' : 'Set as Live Wallpaper'}</span>
          </button>
        </div>
      </div>

      {/* Widget Layer Toggle Bar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/60 border-b border-canvas-border text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-canvas-subtle">Widgets:</span>
          {[
            { type: 'clock' as const, label: 'Clock' },
            { type: 'calendar' as const, label: 'Calendar' },
            { type: 'today_tasks' as const, label: "Today's Tasks" },
            { type: 'pending_tasks' as const, label: 'Pending Tasks' },
            { type: 'progress' as const, label: 'Progress' },
            { type: 'timer' as const, label: 'Apple Timer' }
          ].map(w => {
            const match = currentWidgets.find(x => x.type === w.type);
            const isVisible = match && match.visible;
            return (
              <button
                key={w.type}
                onClick={() => handleToggleWidget(w.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  isVisible
                    ? 'bg-canvas-accent/20 border-canvas-accent/40 text-canvas-accent'
                    : 'bg-white/5 border-white/5 text-canvas-muted hover:text-white'
                }`}
              >
                <span>{isVisible ? '✓' : '+'}</span>
                <span>{w.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-canvas-subtle">
          Drag any widget to reposition on 1440×900 desktop canvas
        </span>
      </div>

      {activationFeedback && (
        <div className="bg-canvas-accent/20 border-b border-canvas-accent/30 text-center py-2 text-xs font-medium text-canvas-accent flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{activationFeedback}</span>
        </div>
      )}

      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-950/80">
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            width: '1440px',
            height: '900px',
            background: activePreset?.background_value || '#0B1020',
            transform: 'scale(0.72)',
            transformOrigin: 'center center'
          }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 ring-8 ring-black/40"
        >
          {/* Helper Grid Hint in Editor Mode */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Render draggable widgets */}
          {currentWidgets.map(widget => (
            <div
              key={widget.id}
              onMouseDown={(e) => handleMouseDown(widget.id, e)}
              className="absolute select-none"
              style={{
                left: `${widget.position_x}px`,
                top: `${widget.position_y}px`,
                width: `${widget.width}px`,
                height: `${widget.height}px`
              }}
            >
              <div
                className={`w-full h-full rounded-2xl ring-2 transition-all cursor-grab active:cursor-grabbing ${
                  selectedWidgetId === widget.id ? 'ring-canvas-accent shadow-2xl' : 'ring-transparent hover:ring-white/30'
                }`}
              >
                <WidgetRenderer widget={widget} theme={activePreset?.theme} isEditor={true} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
