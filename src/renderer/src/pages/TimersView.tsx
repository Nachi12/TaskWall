import React, { useState } from 'react';
import { useTimerStore, QUICK_PRESETS, APPLE_TIMER_COLORS } from '../stores/useTimerStore';
import { AppleTimerDisplay } from '../components/AppleTimerDisplay';
import {
  Timer as TimerIcon,
  Plus,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Sparkles,
  Bell,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export const TimersView: React.FC = () => {
  const {
    timers,
    activeTimerId,
    setActiveTimer,
    createTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    deleteTimer,
    resetTimer,
    dismissCompleted,
    soundEnabled,
    setSoundEnabled,
    testSound
  } = useTimerStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHours, setNewHours] = useState('0');
  const [newMinutes, setNewMinutes] = useState('25');
  const [newSeconds, setNewSeconds] = useState('0');
  const [newColor, setNewColor] = useState('#FF9F0A');

  const activeTimer =
    timers.find(t => t.id === activeTimerId) ||
    timers[0];

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(newHours, 10) || 0;
    const m = parseInt(newMinutes, 10) || 0;
    const s = parseInt(newSeconds, 10) || 0;
    const total = h * 3600 + m * 60 + s;

    if (total > 0) {
      createTimer(total, newLabel.trim() || 'Focus Session', newColor, true);
      setIsCreating(false);
      setNewLabel('');
    }
  };

  const formatDigits = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <TimerIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">Apple Timers</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                macOS Style
              </span>
            </div>
            <p className="text-xs text-canvas-subtle mt-0.5">
              Precision circular countdown timers with multi-timer support and chime alarms
            </p>
          </div>
        </div>

        {/* Audio controls & New Timer Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              soundEnabled
                ? 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
            title={soundEnabled ? 'Timer Sound Enabled (Click to Mute)' : 'Timer Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {soundEnabled && (
            <button
              onClick={testSound}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all active:scale-95"
            >
              Test Chime
            </button>
          )}

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Timer</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Featured Apple Circular Timer Display */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Glow Behind Ring */}
          <div
            className="absolute w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: activeTimer?.color || '#FF9F0A' }}
          />

          {activeTimer ? (
            <AppleTimerDisplay timer={activeTimer} size="large" showPresets={true} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <TimerIcon className="w-12 h-12 text-canvas-subtle animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-white">No Active Timers</h3>
                <p className="text-xs text-canvas-subtle mt-1">
                  Pick a preset below or click &quot;New Timer&quot; to begin.
                </p>
              </div>
              <button
                onClick={() => createTimer(1500, 'Focus Session', '#FF9F0A', true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
              >
                Start 25m Pomodoro Focus
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Timers & Presets Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Timers List (Multiple simultaneous timers support) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  All Timers ({timers.length})
                </h2>
              </div>
              <span className="text-[11px] text-canvas-subtle">
                {timers.filter(t => t.status === 'running').length} Running
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {timers.map(timer => {
                const isSelected = timer.id === activeTimerId;
                const isRunning = timer.status === 'running';
                const isCompleted = timer.status === 'completed';
                const isPaused = timer.status === 'paused';

                return (
                  <div
                    key={timer.id}
                    onClick={() => setActiveTimer(timer.id)}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                      isSelected
                        ? 'bg-white/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Mini indicator dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: timer.color || '#FF9F0A',
                          boxShadow: isRunning ? `0 0 8px ${timer.color || '#FF9F0A'}` : 'none'
                        }}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {timer.label}
                          </span>
                          {isRunning && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          )}
                          {isCompleted && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-300">
                              Done
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-sm font-semibold text-slate-300 mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatDigits(timer.remainingSeconds)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissCompleted(timer.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-yellow-400 text-slate-950 font-bold text-[10px] hover:bg-yellow-300"
                        >
                          OK
                        </button>
                      ) : isRunning ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pauseTimer(timer.id);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                          title="Pause"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startTimer(timer.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10"
                          title="Start"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTimer(timer.id);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-canvas-subtle hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors"
                        title="Delete timer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Preset Library */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              One-Click Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PRESETS.map(p => (
                <button
                  key={p.seconds}
                  onClick={() => createTimer(p.seconds, p.name, '#FF9F0A', true)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 active:scale-95 transition-all text-left group"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-canvas-subtle">{p.name}</div>
                  </div>
                  <Play className="w-3 h-3 text-canvas-subtle group-hover:text-amber-400 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Custom Timer */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNew}
            className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TimerIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create Apple Timer</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-canvas-subtle hover:text-white px-2 py-1"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-canvas-muted block mb-1.5">Timer Name</label>
              <input
                type="text"
                placeholder="e.g. Deep Work, HIIT Workout, Baking"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-canvas-subtle text-sm focus:border-amber-500 outline-none"
              />
            </div>

            {/* Hours, Minutes, Seconds */}
            <div>
              <label className="text-xs font-semibold text-canvas-muted block mb-1.5">Duration</label>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-canvas-subtle block mb-1">Hours</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full text-center bg-transparent text-white font-mono font-bold text-lg outline-none"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-canvas-subtle block mb-1">Minutes</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    className="w-full text-center bg-transparent text-white font-mono font-bold text-lg outline-none"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-canvas-subtle block mb-1">Seconds</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newSeconds}
                    onChange={(e) => setNewSeconds(e.target.value)}
                    className="w-full text-center bg-transparent text-white font-mono font-bold text-lg outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Color Accent */}
            <div>
              <label className="text-xs font-semibold text-canvas-muted block mb-1.5">Accent Color</label>
              <div className="flex items-center gap-3">
                {APPLE_TIMER_COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setNewColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-all ${
                      newColor === c.hex
                        ? 'scale-110 ring-2 ring-white shadow-lg'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-canvas-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Start Timer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
