import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { useWallpaperStore } from '../stores/useWallpaperStore';
import { TodayTasksWidget } from '../widgets/TodayTasksWidget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { PendingTasksWidget } from '../widgets/PendingTasksWidget';
import { ProgressWidget } from '../widgets/ProgressWidget';
import { ClockWidget } from '../widgets/ClockWidget';
import { TimerWidget } from '../widgets/TimerWidget';
import { WallpaperEditor } from './WallpaperEditor';
import { SettingsView } from './SettingsView';
import { TimersView } from './TimersView';
import { useTimerStore } from '../stores/useTimerStore';
import {
  CheckSquare,
  Calendar,
  Layout,
  Settings,
  MonitorPlay,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Timer as TimerIcon
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'tasks' | 'timers' | 'editor' | 'settings'>('tasks');
  const runningTimersCount = useTimerStore(s => s.timers.filter(t => t.status === 'running').length);
  const {
    isDesktopActive,
    isActivating,
    activateDesktopMode,
    deactivateDesktopMode,
    fetchSettings,
    fetchPresets,
    fetchActivePreset,
    initListeners: initWallpaperListeners
  } = useWallpaperStore();

  const {
    fetchTasks,
    fetchPendingTasks,
    fetchCalendarSummary,
    initListeners: initTaskListeners
  } = useTaskStore();

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchPresets();
    fetchActivePreset();
    fetchTasks();
    fetchPendingTasks();
    fetchCalendarSummary();

    const unsubW = initWallpaperListeners();
    const unsubT = initTaskListeners();

    return () => {
      unsubW();
      unsubT();
    };
  }, []);

  const handleToggleLiveWallpaper = async () => {
    if (isDesktopActive) {
      await deactivateDesktopMode();
      setFeedback('Desktop wallpaper mode paused.');
    } else {
      const res = await activateDesktopMode();
      setFeedback(res.message);
      // Close the Studio window so only the live wallpaper remains
      setTimeout(() => {
        window.close();
      }, 150);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="flex flex-col h-screen bg-canvas-bg text-canvas-text select-none">
      {/* Top Application Bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-canvas-border bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-canvas-accent to-canvas-secondary flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Layers className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight">DayCanvas Studio</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-white/10 text-canvas-muted">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-canvas-subtle">Interactive Calendar & Task Desktop Wallpaper</p>
          </div>
        </div>

        {/* Live Wallpaper Trigger */}
        <div className="flex items-center gap-4">
          {feedback && (
            <div className="flex items-center gap-1.5 text-xs text-canvas-accent font-medium bg-canvas-accent/10 px-3 py-1 rounded-full border border-canvas-accent/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={handleToggleLiveWallpaper}
            disabled={isActivating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
              isDesktopActive
                ? 'bg-canvas-success/20 hover:bg-canvas-success/30 text-emerald-300 border border-canvas-success/40'
                : 'bg-gradient-to-r from-canvas-accent to-canvas-secondary hover:opacity-90 text-slate-950 shadow-purple-500/25'
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            <span>
              {isActivating
                ? 'Applying...'
                : isDesktopActive
                ? '● Live Wallpaper Active (Click to Pause)'
                : 'Set as Live Wallpaper'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-60 p-4 border-r border-canvas-border bg-slate-950/20 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-canvas-subtle uppercase">
              Navigation
            </div>
            {[
              { id: 'tasks', label: 'Tasks & Calendar', icon: CheckSquare },
              { id: 'timers', label: 'Apple Timers', icon: TimerIcon, badge: runningTimersCount > 0 ? `${runningTimersCount} active` : null },
              { id: 'editor', label: 'Wallpaper Studio', icon: Layout },
              { id: 'settings', label: 'Preferences', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-canvas-accent text-slate-950 shadow-md font-bold'
                      : 'text-canvas-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick status card in sidebar */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Desktop Status</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isDesktopActive ? 'bg-canvas-success shadow-lg shadow-canvas-success' : 'bg-canvas-subtle'
                }`}
              />
            </div>
            <p className="text-[11px] text-canvas-subtle leading-relaxed">
              {isDesktopActive
                ? 'Widgets are live on your desktop background.'
                : 'Live wallpaper is paused. Click "Set as Live Wallpaper" to activate.'}
            </p>
          </div>
        </aside>

        {/* Workspace Content View */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'tasks' && (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
              {/* Top Row: Clock, Apple Timer & Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[210px]">
                <ClockWidget />
                <TimerWidget />
                <ProgressWidget />
              </div>

              {/* Main Grid: Calendar on left, Today's tasks + Pending tasks on right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 h-[480px]">
                  <CalendarWidget />
                </div>
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="h-[280px]">
                    <TodayTasksWidget />
                  </div>
                  <div className="h-[220px]">
                    <PendingTasksWidget />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'timers' && <TimersView />}

          {currentTab === 'editor' && <WallpaperEditor />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
