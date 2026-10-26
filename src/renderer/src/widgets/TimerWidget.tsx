import React from 'react';
import { useTimerStore, QUICK_PRESETS } from '../stores/useTimerStore';
import { Play, Pause, RotateCcw, Plus, Bell, Timer as TimerIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface TimerWidgetProps {
  theme?: string;
  config?: {
    showQuickPresets?: boolean;
    compact?: boolean;
  };
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  theme = 'midnight',
  config = {}
}) => {
  const {
    timers,
    activeTimerId,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addMinute,
    dismissCompleted,
    createTimer,
    setActiveTimer
  } = useTimerStore();

  const isLight = theme === 'morning';
  const panelClass = isLight ? 'glass-panel-light text-slate-800' : 'glass-panel text-white';

  // Find active or first running timer, or fallback to first
  const activeTimer =
    timers.find(t => t.id === activeTimerId) ||
    timers.find(t => t.status === 'running') ||
    timers[0];

  const formatDigits = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  if (!activeTimer) {
    return (
      <div className={`p-5 rounded-2xl ${panelClass} flex flex-col justify-between h-full select-none transition-all duration-300 hover:border-canvas-border-focus`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-4 h-4 text-canvas-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-canvas-muted">Focus Timer</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center my-auto">
          <button
            onClick={() => createTimer(1500, 'Focus Session', '#FF9F0A', true)}
            className="px-4 py-2 rounded-xl bg-canvas-accent text-slate-950 font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            Start 25m Pomodoro
          </button>
        </div>
      </div>
    );
  }

  const isRunning = activeTimer.status === 'running';
  const isPaused = activeTimer.status === 'paused';
  const isCompleted = activeTimer.status === 'completed';
  const isIdle = activeTimer.status === 'idle';

  // SVG Ring calculation
  const svgSize = 100;
  const stroke = 6;
  const radius = (svgSize - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = activeTimer.totalDurationSeconds > 0
    ? activeTimer.remainingSeconds / activeTimer.totalDurationSeconds
    : 0;
  const strokeDashoffset = circumference * (1 - fraction);

  const finishTime =
    activeTimer.status === 'running' && activeTimer.targetEndTime
      ? format(new Date(activeTimer.targetEndTime), 'h:mm a')
      : null;

  return (
    <div className={`p-4 rounded-2xl ${panelClass} flex flex-col justify-between h-full select-none transition-all duration-300 hover:border-canvas-border-focus overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TimerIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {activeTimer.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>LIVE</span>
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] font-bold text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-full animate-bounce">
              DONE
            </span>
          )}
        </div>
      </div>

      {/* Main Body: Circular Apple Ring + Digits & Controls */}
      <div className="flex items-center justify-around py-1 gap-3 my-auto">
        {/* Apple Circular Ring */}
        <div className="relative flex-shrink-0" style={{ width: svgSize, height: svgSize }}>
          <svg
            width={svgSize}
            height={svgSize}
            className="transform -rotate-90 origin-center transition-all duration-300"
          >
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={stroke}
              fill="transparent"
            />
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke={activeTimer.color || '#FF9F0A'}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: isRunning ? 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                filter: isRunning ? `drop-shadow(0 0 8px ${activeTimer.color || '#FF9F0A'}80)` : 'none'
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`font-mono font-extrabold text-lg tracking-tight ${
                isCompleted ? 'text-yellow-400 animate-pulse' : 'text-white'
              }`}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {isCompleted ? "00:00" : formatDigits(activeTimer.remainingSeconds)}
            </span>
            {finishTime && (
              <span className="text-[9px] text-canvas-subtle flex items-center gap-0.5 mt-0.5">
                <Bell className="w-2.5 h-2.5 text-amber-400" />
                <span>{finishTime}</span>
              </span>
            )}
          </div>
        </div>

        {/* Apple Style Control Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <button
                onClick={() => dismissCompleted(activeTimer.id)}
                className="px-4 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                Dismiss
              </button>
            ) : isRunning ? (
              <button
                onClick={() => pauseTimer(activeTimer.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs text-slate-950 transition-all active:scale-95 shadow-md"
                style={{ backgroundColor: activeTimer.color || '#FF9F0A' }}
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={() => resumeTimer(activeTimer.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs text-slate-950 transition-all active:scale-95 shadow-md"
                style={{ backgroundColor: activeTimer.color || '#FF9F0A' }}
              >
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={() => startTimer(activeTimer.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs text-slate-950 transition-all active:scale-95 shadow-md"
                style={{ backgroundColor: activeTimer.color || '#FF9F0A' }}
              >
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                <span>Start</span>
              </button>
            )}

            <button
              onClick={() => resetTimer(activeTimer.id)}
              disabled={isIdle}
              className={`p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-300 ${
                isIdle ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => addMinute(activeTimer.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-slate-200 active:scale-95 transition-all shadow-sm"
            title="Add 1 minute"
          >
            <Plus className="w-3 h-3 text-amber-400 stroke-[2.5]" />
            <span>1 min</span>
          </button>
        </div>
      </div>

      {/* Quick Switch / Preset Buttons */}
      <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/10 overflow-x-auto pr-1">
        {[
          { label: '5m', sec: 300, name: 'Break' },
          { label: '15m', sec: 900, name: 'Short' },
          { label: '25m', sec: 1500, name: 'Pomodoro' },
          { label: '45m', sec: 2700, name: 'Sprint' }
        ].map(p => (
          <button
            key={p.sec}
            onClick={() => createTimer(p.sec, p.name, '#FF9F0A', true)}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-canvas-muted hover:text-white transition-all active:scale-95"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
