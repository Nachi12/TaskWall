import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimerStore, QUICK_PRESETS } from '../../src/renderer/src/stores/useTimerStore';

describe('Apple-Style Timers', () => {
  beforeEach(() => {
    // Reset store to known state
    const store = useTimerStore.getState();
    store.timers.forEach(t => store.deleteTimer(t.id));
  });

  it('creates an Apple timer with correct duration, label and color', () => {
    const store = useTimerStore.getState();
    const timerId = store.createTimer(1500, 'Pomodoro Sprint', '#FF9F0A', false);

    const created = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(created).toBeDefined();
    expect(created?.label).toBe('Pomodoro Sprint');
    expect(created?.totalDurationSeconds).toBe(1500);
    expect(created?.remainingSeconds).toBe(1500);
    expect(created?.status).toBe('idle');
    expect(created?.color).toBe('#FF9F0A');
  });

  it('starts, pauses, and resumes an Apple timer correctly', () => {
    const store = useTimerStore.getState();
    const timerId = store.createTimer(300, 'Tea Break', '#34D399', false);

    // Start
    store.startTimer(timerId);
    let current = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(current?.status).toBe('running');
    expect(current?.targetEndTime).toBeGreaterThan(Date.now());

    // Pause
    store.pauseTimer(timerId);
    current = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(current?.status).toBe('paused');
    expect(current?.targetEndTime).toBeNull();

    // Resume
    store.resumeTimer(timerId);
    current = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(current?.status).toBe('running');
    expect(current?.targetEndTime).toBeGreaterThan(Date.now());
  });

  it('supports the Apple +1 Min bump feature', () => {
    const store = useTimerStore.getState();
    const timerId = store.createTimer(60, 'Quick 1m', '#FF9F0A', false);

    store.addMinute(timerId);
    const updated = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(updated?.totalDurationSeconds).toBe(120);
    expect(updated?.remainingSeconds).toBe(120);
  });

  it('handles countdown tick and timer completion', () => {
    const store = useTimerStore.getState();
    const timerId = store.createTimer(2, 'Expiring Timer', '#FB7185', true);

    // Manipulate targetEndTime to be in the past
    useTimerStore.setState(state => ({
      timers: state.timers.map(t =>
        t.id === timerId ? { ...t, targetEndTime: Date.now() - 1000 } : t
      )
    }));

    // Trigger tick
    useTimerStore.getState().tick();

    const finished = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(finished?.status).toBe('completed');
    expect(finished?.remainingSeconds).toBe(0);

    // Dismiss
    store.dismissCompleted(timerId);
    const dismissed = useTimerStore.getState().timers.find(t => t.id === timerId);
    expect(dismissed?.status).toBe('idle');
    expect(dismissed?.remainingSeconds).toBe(2);
  });

  it('supports multiple simultaneous timers running concurrently', () => {
    const store = useTimerStore.getState();
    const t1 = store.createTimer(1500, 'Focus Session', '#FF9F0A', true);
    const t2 = store.createTimer(300, 'Quick Break', '#38BDF8', true);

    const activeTimers = useTimerStore.getState().timers.filter(t => t.status === 'running');
    expect(activeTimers.length).toBe(2);
    expect(activeTimers.some(t => t.id === t1)).toBe(true);
    expect(activeTimers.some(t => t.id === t2)).toBe(true);
  });

  it('provides Apple-style quick presets including Pomodoro and Break', () => {
    expect(QUICK_PRESETS.length).toBeGreaterThanOrEqual(8);
    expect(QUICK_PRESETS.some(p => p.seconds === 1500 && p.name.includes('Pomodoro'))).toBe(true);
    expect(QUICK_PRESETS.some(p => p.seconds === 60)).toBe(true);
    expect(QUICK_PRESETS.some(p => p.seconds === 3600)).toBe(true);
  });
});
