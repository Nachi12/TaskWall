import { contextBridge, ipcRenderer } from 'electron';
import { DayCanvasAPI, Task, WallpaperPreset, WidgetConfig, AppSettings } from '../shared/types';

const api: DayCanvasAPI = {
  // Tasks
  getTasks: (date?: string) => ipcRenderer.invoke('tasks:get', date),
  getPendingTasks: () => ipcRenderer.invoke('tasks:get-pending'),
  getTaskCalendarSummary: (month: string) => ipcRenderer.invoke('tasks:calendar-summary', month),
  createTask: (data: Partial<Task> & { title: string; scheduled_date: string }) => ipcRenderer.invoke('tasks:create', data),
  updateTask: (id: string, updates: Partial<Task>) => ipcRenderer.invoke('tasks:update', id, updates),
  deleteTask: (id: string) => ipcRenderer.invoke('tasks:delete', id),
  toggleTaskStatus: (id: string) => ipcRenderer.invoke('tasks:toggle-status', id),
  reorderTasks: (orderedIds: string[]) => ipcRenderer.invoke('tasks:reorder', orderedIds),
  rescheduleTask: (id: string, newDate: string) => ipcRenderer.invoke('tasks:reschedule', id, newDate),

  // Widgets & Wallpaper
  getWidgets: () => ipcRenderer.invoke('widgets:get'),
  saveWidgets: (widgets: WidgetConfig[]) => ipcRenderer.invoke('widgets:save', widgets),
  getWallpaperPresets: () => ipcRenderer.invoke('wallpaper:presets'),
  getActivePreset: () => ipcRenderer.invoke('wallpaper:active-preset'),
  saveActivePreset: (preset: WallpaperPreset) => ipcRenderer.invoke('wallpaper:save-preset', preset),

  // Desktop Live Wallpaper
  activateDesktopMode: () => ipcRenderer.invoke('wallpaper:activate-desktop'),
  deactivateDesktopMode: () => ipcRenderer.invoke('wallpaper:deactivate-desktop'),
  getDesktopCapabilities: () => ipcRenderer.invoke('wallpaper:capabilities'),
  setIgnoreMouseEvents: (ignore: boolean, forward: boolean = true) => 
    ipcRenderer.invoke('wallpaper:set-ignore-mouse', ignore, forward),
  openDashboardWindow: () => ipcRenderer.invoke('wallpaper:open-dashboard'),
  quitApp: () => ipcRenderer.invoke('app:quit'),

  // Settings & Displays
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('settings:update', settings),
  getDisplays: () => ipcRenderer.invoke('displays:get'),

  // Event Listeners
  onTasksChanged: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('tasks:changed', listener);
    return () => {
      ipcRenderer.removeListener('tasks:changed', listener);
    };
  },
  onWallpaperChanged: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('wallpaper:changed', listener);
    return () => {
      ipcRenderer.removeListener('wallpaper:changed', listener);
    };
  },
  onDesktopModeChanged: (callback: (active: boolean) => void) => {
    const listener = (_: any, active: boolean) => callback(active);
    ipcRenderer.on('desktop-mode:changed', listener);
    return () => {
      ipcRenderer.removeListener('desktop-mode:changed', listener);
    };
  }
};

contextBridge.exposeInMainWorld('api', api);
