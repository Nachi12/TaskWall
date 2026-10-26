import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Task, WallpaperPreset, WidgetConfig, AppSettings } from '../../shared/types';

let dbInstance: Database.Database | null = null;

export function getDatabasePath(): string {
  let userDataPath: string;
  try {
    // Dynamic require so testing environments without Electron don't fail
    const electron = require('electron');
    userDataPath = electron.app?.getPath ? electron.app.getPath('userData') : path.join(process.cwd(), '.daycanvas-data');
  } catch {
    userDataPath = path.join(process.cwd(), '.daycanvas-data');
  }

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  return path.join(userDataPath, 'daycanvas.db');
}

export function initDatabase(customPath?: string): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = customPath || getDatabasePath();
  const db = new Database(dbPath);

  // Enable WAL mode for high performance and durability
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  seedDefaultData(db);

  dbInstance = db;
  return db;
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const currentVersionRow = db.prepare('SELECT MAX(version) as version FROM schema_migrations').get() as { version: number | null };
  const currentVersion = currentVersionRow?.version || 0;

  if (currentVersion < 1) {
    const migrationV1 = `
      BEGIN TRANSACTION;

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        scheduled_date TEXT NOT NULL,
        due_at TEXT,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
        category_id TEXT,
        carry_forward_policy TEXT CHECK(carry_forward_policy IN ('auto_carry', 'manual', 'backlog')) DEFAULT 'auto_carry',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS widgets (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        monitor_id TEXT DEFAULT 'primary',
        position_x REAL NOT NULL,
        position_y REAL NOT NULL,
        width REAL NOT NULL,
        height REAL NOT NULL,
        config_json TEXT DEFAULT '{}',
        visible INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS wallpaper_presets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        background_type TEXT NOT NULL,
        background_value TEXT NOT NULL,
        theme TEXT NOT NULL,
        widget_layout TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT INTO schema_migrations (version, applied_at) VALUES (1, datetime('now'));

      COMMIT;
    `;
    db.exec(migrationV1);
  }
}

export const DEFAULT_PRESETS: WallpaperPreset[] = [
  {
    id: 'preset-midnight-focus',
    name: 'Midnight Focus',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #0B1020 0%, #151C38 50%, #1B1536 100%)',
    theme: 'midnight',
    widgets: [
      {
        id: 'widget-clock',
        type: 'clock',
        position_x: 60,
        position_y: 50,
        width: 380,
        height: 130,
        visible: true,
        config: { showSeconds: false, greeting: true }
      },
      {
        id: 'widget-calendar',
        type: 'calendar',
        position_x: 60,
        position_y: 200,
        width: 380,
        height: 440,
        visible: true,
        config: { weekStart: 'monday' }
      },
      {
        id: 'widget-today-tasks',
        type: 'today_tasks',
        position_x: 940,
        position_y: 50,
        width: 440,
        height: 460,
        visible: true,
        config: { allowInlineAdd: true, showPriority: true }
      },
      {
        id: 'widget-pending-tasks',
        type: 'pending_tasks',
        position_x: 940,
        position_y: 530,
        width: 440,
        height: 270,
        visible: true,
        config: { maxItems: 5 }
      },
      {
        id: 'widget-progress',
        type: 'progress',
        position_x: 460,
        position_y: 50,
        width: 460,
        height: 130,
        visible: true,
        config: { showPercentage: true }
      },
      {
        id: 'widget-timer',
        type: 'timer',
        position_x: 460,
        position_y: 200,
        width: 460,
        height: 220,
        visible: true,
        config: { showQuickPresets: true }
      }
    ]
  },
  {
    id: 'preset-soft-morning',
    name: 'Soft Morning',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #E2E8F0 0%, #EDE9FE 50%, #DBEAFE 100%)',
    theme: 'morning',
    widgets: [
      {
        id: 'widget-clock',
        type: 'clock',
        position_x: 60,
        position_y: 50,
        width: 380,
        height: 130,
        visible: true,
        config: { showSeconds: false, greeting: true }
      },
      {
        id: 'widget-calendar',
        type: 'calendar',
        position_x: 60,
        position_y: 200,
        width: 380,
        height: 440,
        visible: true,
        config: { weekStart: 'monday' }
      },
      {
        id: 'widget-today-tasks',
        type: 'today_tasks',
        position_x: 940,
        position_y: 50,
        width: 440,
        height: 460,
        visible: true,
        config: { allowInlineAdd: true, showPriority: true }
      },
      {
        id: 'widget-pending-tasks',
        type: 'pending_tasks',
        position_x: 940,
        position_y: 530,
        width: 440,
        height: 270,
        visible: true,
        config: { maxItems: 5 }
      },
      {
        id: 'widget-progress',
        type: 'progress',
        position_x: 460,
        position_y: 50,
        width: 460,
        height: 130,
        visible: true,
        config: { showPercentage: true }
      },
      {
        id: 'widget-timer',
        type: 'timer',
        position_x: 460,
        position_y: 200,
        width: 460,
        height: 220,
        visible: true,
        config: { showQuickPresets: true }
      }
    ]
  },
  {
    id: 'preset-minimal-black',
    name: 'Minimal Black',
    background_type: 'color',
    background_value: '#050505',
    theme: 'minimal',
    widgets: [
      {
        id: 'widget-clock',
        type: 'clock',
        position_x: 60,
        position_y: 50,
        width: 380,
        height: 130,
        visible: true,
        config: { showSeconds: false, greeting: true }
      },
      {
        id: 'widget-calendar',
        type: 'calendar',
        position_x: 60,
        position_y: 200,
        width: 380,
        height: 440,
        visible: true,
        config: { weekStart: 'monday' }
      },
      {
        id: 'widget-today-tasks',
        type: 'today_tasks',
        position_x: 940,
        position_y: 50,
        width: 440,
        height: 460,
        visible: true,
        config: { allowInlineAdd: true, showPriority: true }
      },
      {
        id: 'widget-pending-tasks',
        type: 'pending_tasks',
        position_x: 940,
        position_y: 530,
        width: 440,
        height: 270,
        visible: true,
        config: { maxItems: 5 }
      },
      {
        id: 'widget-progress',
        type: 'progress',
        position_x: 460,
        position_y: 50,
        width: 460,
        height: 130,
        visible: true,
        config: { showPercentage: true }
      },
      {
        id: 'widget-timer',
        type: 'timer',
        position_x: 460,
        position_y: 200,
        width: 460,
        height: 220,
        visible: true,
        config: { showQuickPresets: true }
      }
    ]
  }
];

function seedDefaultData(db: Database.Database): void {
  // Check if wallpaper presets are already seeded
  const presetCount = db.prepare('SELECT COUNT(*) as count FROM wallpaper_presets').get() as { count: number };
  if (presetCount.count === 0) {
    const insertPreset = db.prepare(`
      INSERT INTO wallpaper_presets (id, name, background_type, background_value, theme, widget_layout)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const preset of DEFAULT_PRESETS) {
      insertPreset.run(
        preset.id,
        preset.name,
        preset.background_type,
        preset.background_value,
        preset.theme,
        JSON.stringify(preset.widgets)
      );
    }
  }

  // Check default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const defaultSettings: AppSettings = {
      start_on_login: false,
      launch_in_wallpaper_mode: true,
      week_start: 'monday',
      time_format: '12h',
      reduced_motion: false,
      carry_forward_policy: 'auto_carry',
      wallpaper_preset_id: 'preset-midnight-focus',
      blur_intensity: 16,
      widget_opacity: 0.85,
      desktop_mode_active: true
    };

    const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, val] of Object.entries(defaultSettings)) {
      insertSetting.run(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
    }
  }

  // Check if initial tasks exist; if not, seed realistic starter tasks for today and yesterday
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
  if (taskCount.count === 0) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const insertTask = db.prepare(`
      INSERT INTO tasks (id, title, description, scheduled_date, priority, status, carry_forward_policy, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    // Today's tasks
    insertTask.run('t-1', 'Review DayCanvas design tokens', 'Check contrast and font sizes', today, 'high', 'completed', 'auto_carry');
    insertTask.run('t-2', 'Build desktop wallpaper interactive widgets', 'Ensure dynamic mouse click-through', today, 'high', 'in_progress', 'auto_carry');
    insertTask.run('t-3', 'Test calendar rollover behavior', 'Verify carry-forward across midnight', today, 'medium', 'pending', 'auto_carry');
    insertTask.run('t-4', 'Configure multi-display support', 'Detect display bounds and scaling', today, 'low', 'pending', 'auto_carry');

    // Carried-forward task from yesterday (unfinished)
    insertTask.run('t-0', 'Initial architectural research & feasibility plan', 'Completed plan and approved roadmap', yesterday, 'high', 'pending', 'auto_carry');

    // Upcoming task
    insertTask.run('t-5', 'Create production packaging bundles', 'DMG and Windows installer setup', tomorrow, 'medium', 'pending', 'auto_carry');
  }
}
