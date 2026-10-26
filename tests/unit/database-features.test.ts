import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskRepository } from '../../src/main/database/task-repository';
import { WallpaperRepository } from '../../src/main/database/wallpaper-repository';
import { SettingsRepository } from '../../src/main/database/settings-repository';
import { createDesktopAdapter } from '../../src/main/desktop';
import * as dbModule from '../../src/main/database/db';
import fs from 'fs';
import path from 'path';

describe('Database Repositories & Desktop Adapter', () => {
  const testDbPath = path.join(process.cwd(), 'test-features.db');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    dbModule.initDatabase(testDbPath);
  });

  afterEach(() => {
    dbModule.closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('calculates calendar month summary accurately', () => {
    const date1 = '2026-10-15';
    const date2 = '2026-10-20';

    TaskRepository.createTask({ title: 'Task 1', scheduled_date: date1, status: 'completed' });
    TaskRepository.createTask({ title: 'Task 2', scheduled_date: date1, status: 'pending' });
    TaskRepository.createTask({ title: 'Task 3', scheduled_date: date2, status: 'pending' });

    const summary = TaskRepository.getCalendarMonthSummary('2026-10');
    expect(summary[date1]).toBeDefined();
    expect(summary[date1].total).toBe(2);
    expect(summary[date1].completed).toBe(1);

    expect(summary[date2]).toBeDefined();
    expect(summary[date2].total).toBe(1);
    expect(summary[date2].completed).toBe(0);
  });

  it('reschedules a task to a new date and updates correctly', () => {
    const task = TaskRepository.createTask({
      title: 'Move me',
      scheduled_date: '2026-10-10',
      priority: 'low'
    });

    const rescheduled = TaskRepository.rescheduleTask(task.id, '2026-10-28');
    expect(rescheduled.scheduled_date).toBe('2026-10-28');

    const fetched = TaskRepository.getTaskById(task.id);
    expect(fetched?.scheduled_date).toBe('2026-10-28');
  });

  it('loads default wallpaper presets and supports layout persistence', () => {
    const presets = WallpaperRepository.getPresets();
    expect(presets.length).toBeGreaterThanOrEqual(3);

    const midnight = presets.find(p => p.id === 'preset-midnight-focus');
    expect(midnight).toBeDefined();
    expect(midnight?.theme).toBe('midnight');
    expect(midnight?.widgets.length).toBeGreaterThan(0);

    const active = WallpaperRepository.getActivePreset();
    expect(active.id).toBe('preset-midnight-focus');

    // Update widgets in active preset
    const newWidgets = active.widgets.map(w => ({ ...w, position_x: w.position_x + 10 }));
    WallpaperRepository.saveWidgets(newWidgets);

    const updated = WallpaperRepository.getActivePreset();
    expect(updated.widgets[0].position_x).toBe(active.widgets[0].position_x + 10);
  });

  it('persists and retrieves user settings', () => {
    const initial = SettingsRepository.getSettings();
    expect(initial.week_start).toBe('monday');

    SettingsRepository.updateSettings({
      week_start: 'sunday',
      time_format: '24h',
      widget_opacity: 0.9
    });

    const updated = SettingsRepository.getSettings();
    expect(updated.week_start).toBe('sunday');
    expect(updated.time_format).toBe('24h');
    expect(updated.widget_opacity).toBe(0.9);
  });

  it('desktop adapter reports correct platform capabilities', () => {
    const adapter = createDesktopAdapter();
    expect(adapter).toBeDefined();

    const capabilities = adapter.getCapabilities();
    expect(capabilities.platform).toBe(process.platform);
    if (process.platform === 'darwin') {
      expect(capabilities.supported).toBe(true);
      expect(capabilities.nativeLevelSupported).toBe(true);
      expect(capabilities.clickThroughSupported).toBe(true);
      expect(capabilities.spacesSupported).toBe(true);
    }
  });
});
