import { create } from 'zustand';
import { playAppleTimerChime, playAppleButtonTap } from '../utils/sound';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface AppleTimer {
  id: string;
  label: string;
  totalDurationSeconds: number;
  remainingSeconds: number;
  status: TimerStatus;
  color: string;
  createdAt: number;
  targetEndTime: number | null;
}

export const APPLE_TIMER_COLORS = [
  { name: 'Apple Orange', hex: '#FF9F0A', bgClass: 'from-amber-500 to-orange-600' },
  { name: 'Neon Purple', hex: '#A78BFA', bgClass: 'from-purple-500 to-indigo-600' },
  { name: 'Electric Cyan', hex: '#38BDF8', bgClass: 'from-cyan-400 to-blue-600' },
  { name: 'Mint Green', hex: '#34D399', bgClass: 'from-emerald-400 to-teal-600' },
  { name: 'Sunset Coral', hex: '#FB7185', bgClass: 'from-rose-400 to-pink-600' },
  { name: 'Sunflower Yellow', hex: '#FACC15', bgClass: 'from-yellow-400 to-amber-500' }
];

export const QUICK_PRESETS = [
  { label: '1 min', seconds: 60, name: 'Quick 1m' },
  { label: '3 min', seconds: 180, name: 'Tea / Stretch' },
  { label: '5 min', seconds: 300, name: 'Break' },
  { label: '10 min', seconds: 600, name: 'Short Sprint' },
  { label: '15 min', seconds: 900, name: 'Review' },
  { label: '25 min', seconds: 1500, name: 'Pomodoro Focus' },
  { label: '30 min', seconds: 1800, name: 'Deep Work' },
  { label: '45 min', seconds: 2700, name: 'Study Session' },
  { label: '1 hr', seconds: 3600, name: 'Hour Power' }
];

interface TimerStoreState {
  timers: AppleTimer[];
  activeTimerId: string | null;
  soundEnabled: boolean;
  
  // Actions
  createTimer: (durationSeconds: number, label?: string, color?: string, autoStart?: boolean) => string;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  addMinute: (id: string) => void;
  deleteTimer: (id: string) => void;
  dismissCompleted: (id: string) => void;
  setActiveTimer: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  testSound: () => void;
  tick: () => void;
}

const STORAGE_KEY = 'daycanvas_apple_timers';
const SOUND_KEY = 'daycanvas_timer_sound';

function loadPersistedTimers(): AppleTimer[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: AppleTimer[] = JSON.parse(raw);
    const now = Date.now();
    
    // Re-evaluate timers in case user refreshed
    return list.map(t => {
      if (t.status === 'running' && t.targetEndTime) {
        const remaining = Math.max(0, Math.ceil((t.targetEndTime - now) / 1000));
        if (remaining <= 0) {
          return { ...t, remainingSeconds: 0, status: 'completed', targetEndTime: null };
        }
        return { ...t, remainingSeconds: remaining };
      }
      return t;
    });
  } catch {
    return [];
  }
}

function saveTimers(timers: AppleTimer[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }
  } catch {
    // Ignore storage errors
  }
}

export const useTimerStore = create<TimerStoreState>((set, get) => {
  const initialTimers = loadPersistedTimers();
  const initialSound = typeof localStorage !== 'undefined'
    ? localStorage.getItem(SOUND_KEY) !== 'false'
    : true;

  // Seed with default 25m Pomodoro if empty
  const defaultTimers: AppleTimer[] = initialTimers.length > 0 ? initialTimers : [
    {
      id: 'timer-pomodoro-default',
      label: 'Focus Session',
      totalDurationSeconds: 1500,
      remainingSeconds: 1500,
      status: 'idle',
      color: '#FF9F0A',
      createdAt: Date.now(),
      targetEndTime: null
    }
  ];

  return {
    timers: defaultTimers,
    activeTimerId: defaultTimers[0]?.id || null,
    soundEnabled: initialSound,

    createTimer: (durationSeconds, label = 'Timer', color = '#FF9F0A', autoStart = false) => {
      playAppleButtonTap();
      const id = 'timer-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      const newTimer: AppleTimer = {
        id,
        label: label.trim() || 'Timer',
        totalDurationSeconds: Math.max(1, durationSeconds),
        remainingSeconds: Math.max(1, durationSeconds),
        status: autoStart ? 'running' : 'idle',
        color: color || '#FF9F0A',
        createdAt: Date.now(),
        targetEndTime: autoStart ? Date.now() + durationSeconds * 1000 : null
      };

      set(state => {
        const updated = [newTimer, ...state.timers];
        saveTimers(updated);
        return { timers: updated, activeTimerId: id };
      });

      return id;
    },

    startTimer: (id) => {
      playAppleButtonTap();
      const now = Date.now();
      set(state => {
        const updated = state.timers.map(t => {
          if (t.id === id) {
            const rem = t.remainingSeconds > 0 ? t.remainingSeconds : t.totalDurationSeconds;
            return {
              ...t,
              remainingSeconds: rem,
              status: 'running' as TimerStatus,
              targetEndTime: now + rem * 1000
            };
          }
          return t;
        });
        saveTimers(updated);
        return { timers: updated, activeTimerId: id };
      });
    },

    pauseTimer: (id) => {
      playAppleButtonTap();
      const now = Date.now();
      set(state => {
        const updated = state.timers.map(t => {
          if (t.id === id && t.status === 'running') {
            const rem = t.targetEndTime ? Math.max(0, Math.ceil((t.targetEndTime - now) / 1000)) : t.remainingSeconds;
            return {
              ...t,
              remainingSeconds: rem,
              status: 'paused' as TimerStatus,
              targetEndTime: null
            };
          }
          return t;
        });
        saveTimers(updated);
        return { timers: updated };
      });
    },

    resumeTimer: (id) => {
      playAppleButtonTap();
      const now = Date.now();
      set(state => {
        const updated = state.timers.map(t => {
          if (t.id === id) {
            const rem = t.remainingSeconds > 0 ? t.remainingSeconds : t.totalDurationSeconds;
            return {
              ...t,
              remainingSeconds: rem,
              status: 'running' as TimerStatus,
              targetEndTime: now + rem * 1000
            };
          }
          return t;
        });
        saveTimers(updated);
        return { timers: updated, activeTimerId: id };
      });
    },

    resetTimer: (id) => {
      playAppleButtonTap();
      set(state => {
        const updated = state.timers.map(t => {
          if (t.id === id) {
            return {
              ...t,
              remainingSeconds: t.totalDurationSeconds,
              status: 'idle' as TimerStatus,
              targetEndTime: null
            };
          }
          return t;
        });
        saveTimers(updated);
        return { timers: updated };
      });
    },

    addMinute: (id) => {
      playAppleButtonTap();
      set(state => {
        const updated = state.timers.map(t => {
          if (t.id === id) {
            const newTotal = t.totalDurationSeconds + 60;
            const newRemaining = t.remainingSeconds + 60;
            return {
              ...t,
              totalDurationSeconds: newTotal,
              remainingSeconds: newRemaining,
              targetEndTime: t.status === 'running' ? (t.targetEndTime ? t.targetEndTime + 60000 : Date.now() + newRemaining * 1000) : null
            };
          }
          return t;
        });
        saveTimers(updated);
        return { timers: updated };
      });
    },

    deleteTimer: (id) => {
      playAppleButtonTap();
      set(state => {
        const updated = state.timers.filter(t => t.id !== id);
        saveTimers(updated);
        const nextActive = state.activeTimerId === id ? (updated[0]?.id || null) : state.activeTimerId;
        return { timers: updated, activeTimerId: nextActive };
      });
    },

    dismissCompleted: (id) => {
      playAppleButtonTap();
      set(state => {
        const updated = state.timers.map(t => {
          if (t.id === id) {
            return {
              ...t,
              remainingSeconds: t.totalDurationSeconds,
              status: 'idle' as TimerStatus,
              targetEndTime: null
            };
          }
          return t;
        });
        saveTimers(updated);
        return { timers: updated };
      });
    },

    setActiveTimer: (id) => {
      set({ activeTimerId: id });
    },

    setSoundEnabled: (enabled) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SOUND_KEY, String(enabled));
      }
      set({ soundEnabled: enabled });
    },

    testSound: () => {
      playAppleTimerChime();
    },

    tick: () => {
      const now = Date.now();
      const { timers, soundEnabled } = get();
      let hasChanged = false;
      let chimeNeeded = false;

      const updated = timers.map(t => {
        if (t.status === 'running' && t.targetEndTime) {
          const rem = Math.max(0, Math.ceil((t.targetEndTime - now) / 1000));
          if (rem <= 0) {
            hasChanged = true;
            chimeNeeded = true;
            return {
              ...t,
              remainingSeconds: 0,
              status: 'completed' as TimerStatus,
              targetEndTime: null
            };
          } else if (rem !== t.remainingSeconds) {
            hasChanged = true;
            return {
              ...t,
              remainingSeconds: rem
            };
          }
        }
        return t;
      });

      if (chimeNeeded && soundEnabled) {
        playAppleTimerChime();
      }

      if (hasChanged) {
        saveTimers(updated);
        set({ timers: updated });
      }
    }
  };
});

// Setup a singleton ticking interval so timers tick continuously regardless of which screen is displayed
let tickInterval: NodeJS.Timeout | null = null;
if (typeof window !== 'undefined') {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(() => {
    useTimerStore.getState().tick();
  }, 250);
}
