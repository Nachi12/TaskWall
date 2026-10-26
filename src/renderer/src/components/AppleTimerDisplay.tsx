import React, { useState } from 'react';
import { AppleTimer, useTimerStore, QUICK_PRESETS, APPLE_TIMER_COLORS } from '../stores/useTimerStore';
import { Play, Pause, RotateCcw, Plus, Bell, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface AppleTimerDisplayProps {
  timer: AppleTimer;
  size?: 'compact' | 'normal' | 'large';
  showPresets?: boolean;
}

export const AppleTimerDisplay: React.FC<AppleTimerDisplayProps> = ({
  timer,
  size = 'normal',
  showPresets = true
}) => {
  const {
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addMinute,
    dismissCompleted,
    soundEnabled,
    setSoundEnabled,
    testSound,
    createTimer
  } = useTimerStore();

  const [customHours, setCustomHours] = useState('0');
  const [customMinutes, setCustomMinutes] = useState('15');
  const [customSeconds, setCustomSeconds] = useState('0');
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customColor, setCustomColor] = useState(timer.color || '#FF9F0A');

  // Format remaining seconds into HH:MM:SS or MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Calculate completion time
  const getExpectedFinishTime = () => {
    if (timer.status === 'running' && timer.targetEndTime) {
      return format(new Date(timer.targetEndTime), 'h:mm a');
    }
    if (timer.status === 'paused' || timer.status === 'idle') {
      const future = new Date(Date.now() + timer.remainingSeconds * 1000);
      return format(future, 'h:mm a');
    }
    return null;
  };

  // Dimensions based on size
  const dim = {
    compact: { svgSize: 180, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
    normal: { svgSize: 260, stroke: 12, fontSize: 'text-4xl', labelSize: 'text-sm' },
    large: { svgSize: 320, stroke: 14, fontSize: 'text-5xl', labelSize: 'text-base' }
  }[size];

  const radius = (dim.svgSize - dim.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Percentage remaining (1 = full, 0 = done)
  const fraction = timer.totalDurationSeconds > 0
    ? timer.remainingSeconds / timer.totalDurationSeconds
    : 0;
  const strokeDashoffset = circumference * (1 - fraction);

  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';
  const isCompleted = timer.status === 'completed';
  const isIdle = timer.status === 'idle';

  const finishTime = getExpectedFinishTime();

  const handleStartCustom = () => {
    const h = parseInt(customHours, 10) || 0;
    const m = parseInt(customMinutes, 10) || 0;
    const s = parseInt(customSeconds, 10) || 0;
    const total = h * 3600 + m * 60 + s;
    if (total > 0) {
      createTimer(total, customLabel.trim() || 'Custom Timer', customColor, true);
      setIsCustomEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* Timer Circle Representation */}
      <div className="relative flex items-center justify-center" style={{ width: dim.svgSize, height: dim.svgSize }}>
        <svg
          width={dim.svgSize}
          height={dim.svgSize}
          className="transform -rotate-90 origin-center transition-all duration-300"
        >
          {/* Subtle Ambient Background Track */}
          <circle
            cx={dim.svgSize / 2}
            cy={dim.svgSize / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={dim.stroke}
            fill="transparent"
          />

          {/* Active Animated Progress Stroke */}
          <circle
            cx={dim.svgSize / 2}
            cy={dim.svgSize / 2}
            r={radius}
            stroke={timer.color || '#FF9F0A'}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: isRunning ? 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              filter: isRunning ? `drop-shadow(0 0 12px ${timer.color || '#FF9F0A'}80)` : 'none'
            }}
          />
        </svg>

        {/* Center Content Inside Apple Ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {/* Label / Name */}
          <div className="text-xs font-semibold uppercase tracking-wider text-canvas-muted truncate max-w-[80%] mb-1 flex items-center gap-1.5">
            <span>{timer.label}</span>
          </div>

          {/* Large Countdown Digits */}
          <div
            className={`font-mono font-bold tracking-tight ${dim.fontSize} ${
              isCompleted
                ? 'text-canvas-warning animate-bounce'
                : 'text-white'
            }`}
            style={{
              fontVariantNumeric: 'tabular-nums',
              textShadow: isRunning ? `0 0 20px ${timer.color || '#FF9F0A'}40` : 'none'
            }}
          >
            {isCompleted ? "00:00" : formatTime(timer.remainingSeconds)}
          </div>

          {/* Estimated Finish Time or Completion Alert */}
          <div className="h-5 mt-1.5 flex items-center justify-center">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-xs font-bold text-canvas-warning px-2.5 py-0.5 rounded-full bg-canvas-warning/15 border border-canvas-warning/30 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Time&apos;s Up!
              </span>
            ) : finishTime && (isRunning || isPaused) ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-canvas-subtle">
                <Bell className="w-3 h-3 text-canvas-accent" />
                <span>{finishTime}</span>
              </span>
            ) : (
              <span className="text-[11px] text-canvas-subtle">
                {formatTime(timer.totalDurationSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Apple-style Action Buttons Below */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {/* Left Action: Cancel / Reset */}
        <button
          onClick={() => {
            if (isCompleted) {
              dismissCompleted(timer.id);
            } else {
              resetTimer(timer.id);
            }
          }}
          disabled={isIdle}
          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all backdrop-blur-md border ${
            isIdle
              ? 'opacity-30 border-white/5 bg-white/5 text-canvas-subtle cursor-not-allowed'
              : 'border-white/10 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white shadow-lg'
          }`}
          title="Cancel and reset timer"
        >
          <RotateCcw className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Cancel</span>
        </button>

        {/* Center Action: Start / Pause / Resume */}
        {isCompleted ? (
          <button
            onClick={() => dismissCompleted(timer.id)}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs bg-canvas-warning hover:bg-yellow-400 active:scale-95 text-slate-950 shadow-xl shadow-yellow-500/30 transition-all"
          >
            <CheckCircle2 className="w-6 h-6 mb-0.5" />
            <span>Done</span>
          </button>
        ) : isRunning ? (
          <button
            onClick={() => pauseTimer(timer.id)}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all shadow-xl active:scale-95 text-slate-950"
            style={{
              backgroundColor: timer.color || '#FF9F0A',
              boxShadow: `0 10px 25px -5px ${timer.color || '#FF9F0A'}60`
            }}
          >
            <Pause className="w-6 h-6 mb-0.5 fill-current" />
            <span>Pause</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={() => resumeTimer(timer.id)}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all shadow-xl active:scale-95 text-slate-950"
            style={{
              backgroundColor: timer.color || '#FF9F0A',
              boxShadow: `0 10px 25px -5px ${timer.color || '#FF9F0A'}60`
            }}
          >
            <Play className="w-6 h-6 mb-0.5 ml-0.5 fill-current" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            onClick={() => startTimer(timer.id)}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs transition-all shadow-xl active:scale-95 text-slate-950"
            style={{
              backgroundColor: timer.color || '#FF9F0A',
              boxShadow: `0 10px 25px -5px ${timer.color || '#FF9F0A'}60`
            }}
          >
            <Play className="w-6 h-6 mb-0.5 ml-0.5 fill-current" />
            <span>Start</span>
          </button>
        )}

        {/* Right Action: +1 Min (Apple style bump) */}
        <button
          onClick={() => addMinute(timer.id)}
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs font-semibold border border-white/10 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white transition-all shadow-lg backdrop-blur-md"
          title="Add 1 minute"
        >
          <Plus className="w-4 h-4 mb-0.5 text-amber-400 stroke-[2.5]" />
          <span className="text-[10px]">1 Min</span>
        </button>
      </div>

      {/* Quick Apple Preset Chips */}
      {showPresets && (
        <div className="w-full max-w-md mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-canvas-subtle px-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Quick Start Presets</span>
            <button
              onClick={() => setIsCustomEditing(!isCustomEditing)}
              className="text-canvas-accent hover:underline text-[11px] font-medium"
            >
              {isCustomEditing ? 'Close Custom' : 'Custom Time...'}
            </button>
          </div>

          {/* Custom Time Input Form */}
          {isCustomEditing && (
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <label className="text-[10px] text-canvas-subtle block mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="w-full text-center py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-canvas-accent outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-canvas-subtle block mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-full text-center py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-canvas-accent outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-canvas-subtle block mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    className="w-full text-center py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-canvas-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Focus Sprint)"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-canvas-subtle outline-none focus:border-canvas-accent"
                />
                <button
                  onClick={handleStartCustom}
                  className="px-4 py-1.5 rounded-lg bg-canvas-accent text-slate-950 font-bold text-xs hover:opacity-90 active:scale-95 transition-all"
                >
                  Start
                </button>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-canvas-subtle">Color:</span>
                {APPLE_TIMER_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setCustomColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      customColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick preset chips */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {QUICK_PRESETS.slice(0, 8).map(preset => (
              <button
                key={preset.seconds}
                onClick={() => {
                  createTimer(preset.seconds, preset.name, timer.color, true);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-canvas-border-focus active:scale-95 transition-all group"
              >
                <span className="text-xs font-bold text-white group-hover:text-canvas-accent">
                  {preset.label}
                </span>
                <span className="text-[9px] text-canvas-subtle truncate max-w-full">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
