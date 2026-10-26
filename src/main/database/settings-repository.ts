import { getDatabase } from './db';
import { AppSettings } from '../../shared/types';

export class SettingsRepository {
  static getSettings(): AppSettings {
    const db = getDatabase();
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];

    const defaults: AppSettings = {
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

    const result: any = { ...defaults };
    for (const r of rows) {
      if (r.value === 'true') result[r.key] = true;
      else if (r.value === 'false') result[r.key] = false;
      else if (!isNaN(Number(r.value)) && r.value.trim() !== '') result[r.key] = Number(r.value);
      else result[r.key] = r.value;
    }

    return result as AppSettings;
  }

  static updateSettings(updates: Partial<AppSettings>): AppSettings {
    const db = getDatabase();
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    const transaction = db.transaction((entries: [string, any][]) => {
      for (const [key, val] of entries) {
        stmt.run(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
      }
    });

    transaction(Object.entries(updates));
    return this.getSettings();
  }
}
