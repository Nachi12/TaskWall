import { getDatabase, DEFAULT_PRESETS } from './db';
import { WallpaperPreset, WidgetConfig } from '../../shared/types';

export class WallpaperRepository {
  static getPresets(): WallpaperPreset[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM wallpaper_presets').all() as any[];

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      background_type: r.background_type,
      background_value: r.background_value,
      theme: r.theme,
      widgets: JSON.parse(r.widget_layout)
    }));
  }

  static getActivePreset(): WallpaperPreset {
    const db = getDatabase();
    const activeIdRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('wallpaper_preset_id') as { value: string } | undefined;
    const activeId = activeIdRow?.value || DEFAULT_PRESETS[0].id;

    const row = db.prepare('SELECT * FROM wallpaper_presets WHERE id = ?').get(activeId) as any;
    if (row) {
      return {
        id: row.id,
        name: row.name,
        background_type: row.background_type,
        background_value: row.background_value,
        theme: row.theme,
        widgets: JSON.parse(row.widget_layout)
      };
    }

    return DEFAULT_PRESETS[0];
  }

  static savePreset(preset: WallpaperPreset): boolean {
    const db = getDatabase();
    db.prepare(`
      INSERT OR REPLACE INTO wallpaper_presets (id, name, background_type, background_value, theme, widget_layout)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      preset.id,
      preset.name,
      preset.background_type,
      preset.background_value,
      preset.theme,
      JSON.stringify(preset.widgets)
    );

    // Also update settings active preset
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('wallpaper_preset_id', preset.id);
    return true;
  }

  static saveWidgets(widgets: WidgetConfig[]): boolean {
    const active = this.getActivePreset();
    active.widgets = widgets;
    return this.savePreset(active);
  }
}
