import { create } from 'zustand';
import { WallpaperPreset, WidgetConfig, AppSettings, DesktopCapabilities, DisplayInfo } from '@shared/types';

export const INITIAL_PRESETS: WallpaperPreset[] = [
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

interface WallpaperState {
  activePreset: WallpaperPreset;
  presets: WallpaperPreset[];
  settings: AppSettings | null;
  capabilities: DesktopCapabilities | null;
  displays: DisplayInfo[];
  isDesktopActive: boolean;
  isActivating: boolean;

  fetchActivePreset: () => Promise<void>;
  fetchPresets: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchCapabilities: () => Promise<void>;
  fetchDisplays: () => Promise<void>;
  saveWidgets: (widgets: WidgetConfig[]) => Promise<void>;
  selectPreset: (presetId: string) => Promise<void>;
  updateActivePreset: (preset: WallpaperPreset) => Promise<void>;
  activateDesktopMode: () => Promise<{ success: boolean; message: string }>;
  deactivateDesktopMode: () => Promise<{ success: boolean; message: string }>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  initListeners: () => () => void;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  activePreset: INITIAL_PRESETS[0],
  presets: INITIAL_PRESETS,
  settings: null,
  capabilities: null,
  displays: [],
  isDesktopActive: false,
  isActivating: false,

  fetchActivePreset: async () => {
    try {
      if (window.api?.getActivePreset) {
        const activePreset = await window.api.getActivePreset();
        if (activePreset) set({ activePreset });
      }
    } catch (err) {
      console.error('Failed to fetch active preset:', err);
    }
  },

  fetchPresets: async () => {
    try {
      if (window.api?.getWallpaperPresets) {
        const presets = await window.api.getWallpaperPresets();
        if (presets?.length) set({ presets });
      }
    } catch (err) {
      console.error('Failed to fetch presets:', err);
    }
  },

  fetchSettings: async () => {
    try {
      if (window.api?.getSettings) {
        const settings = await window.api.getSettings();
        if (settings) set({ settings, isDesktopActive: settings.desktop_mode_active });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  },

  fetchCapabilities: async () => {
    try {
      if (window.api?.getDesktopCapabilities) {
        const capabilities = await window.api.getDesktopCapabilities();
        if (capabilities) set({ capabilities });
      }
    } catch (err) {
      console.error('Failed to fetch capabilities:', err);
    }
  },

  fetchDisplays: async () => {
    try {
      if (window.api?.getDisplays) {
        const displays = await window.api.getDisplays();
        if (displays) set({ displays });
      }
    } catch (err) {
      console.error('Failed to fetch displays:', err);
    }
  },

  saveWidgets: async (widgets: WidgetConfig[]) => {
    try {
      if (window.api?.saveWidgets && get().activePreset) {
        await window.api.saveWidgets(widgets);
        set(state => ({
          activePreset: { ...state.activePreset, widgets }
        }));
      }
    } catch (err) {
      console.error('Failed to save widgets:', err);
    }
  },

  selectPreset: async (presetId: string) => {
    const preset = get().presets.find(p => p.id === presetId);
    if (!preset) return;
    try {
      if (window.api?.saveActivePreset) {
        await window.api.saveActivePreset(preset);
      }
      set({ activePreset: preset });
    } catch (err) {
      console.error('Failed to select preset:', err);
    }
  },

  updateActivePreset: async (preset: WallpaperPreset) => {
    try {
      if (window.api?.saveActivePreset) {
        await window.api.saveActivePreset(preset);
      }
      set({ activePreset: preset });
    } catch (err) {
      console.error('Failed to update active preset:', err);
    }
  },

  activateDesktopMode: async () => {
    set({ isActivating: true });
    try {
      if (window.api?.activateDesktopMode) {
        const res = await window.api.activateDesktopMode();
        if (res.success) {
          set({ isDesktopActive: true });
        }
        return res;
      }
      return { success: false, message: 'API not available' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Activation failed' };
    } finally {
      set({ isActivating: false });
    }
  },

  deactivateDesktopMode: async () => {
    try {
      if (window.api?.deactivateDesktopMode) {
        const res = await window.api.deactivateDesktopMode();
        set({ isDesktopActive: false });
        return res;
      }
      return { success: false, message: 'API not available' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Deactivation failed' };
    }
  },

  updateSettings: async (updates: Partial<AppSettings>) => {
    try {
      if (window.api?.updateSettings) {
        const updated = await window.api.updateSettings(updates);
        set({ settings: updated, isDesktopActive: updated.desktop_mode_active });
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  },

  initListeners: () => {
    const unsub1 = window.api?.onWallpaperChanged?.(() => {
      get().fetchActivePreset();
      get().fetchPresets();
    });

    const unsub2 = window.api?.onDesktopModeChanged?.((active) => {
      set({ isDesktopActive: active });
    });

    return () => {
      unsub1?.();
      unsub2?.();
    };
  }
}));
