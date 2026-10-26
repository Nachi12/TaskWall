import { ipcMain, BrowserWindow, app } from 'electron';
import { TaskRepository } from '../database/task-repository';
import { WallpaperRepository } from '../database/wallpaper-repository';
import { SettingsRepository } from '../database/settings-repository';
import { DesktopAdapter } from '../desktop/desktop-adapter';
import { Task, WallpaperPreset, WidgetConfig, AppSettings } from '../../shared/types';

export function registerIpcHandlers(
  desktopAdapter: DesktopAdapter,
  getWallpaperWindow: () => BrowserWindow | null,
  getDashboardWindow: () => BrowserWindow | null,
  openDashboard: (tab?: string) => void
): void {
  // Broadcast helper
  const broadcast = (channel: string, ...args: any[]) => {
    const wallWin = getWallpaperWindow();
    const dashWin = getDashboardWindow();
    if (wallWin && !wallWin.isDestroyed()) wallWin.webContents.send(channel, ...args);
    if (dashWin && !dashWin.isDestroyed()) dashWin.webContents.send(channel, ...args);
  };

  // --- Task IPC Handlers ---
  ipcMain.handle('tasks:get', async (_, date?: string) => {
    return TaskRepository.getTasksForDate(date);
  });

  ipcMain.handle('tasks:get-pending', async () => {
    return TaskRepository.getPendingTasks();
  });

  ipcMain.handle('tasks:calendar-summary', async (_, month: string) => {
    return TaskRepository.getCalendarMonthSummary(month);
  });

  ipcMain.handle('tasks:create', async (_, data: Partial<Task> & { title: string; scheduled_date: string }) => {
    const task = TaskRepository.createTask(data);
    broadcast('tasks:changed');
    return task;
  });

  ipcMain.handle('tasks:update', async (_, id: string, updates: Partial<Task>) => {
    const task = TaskRepository.updateTask(id, updates);
    broadcast('tasks:changed');
    return task;
  });

  ipcMain.handle('tasks:delete', async (_, id: string) => {
    const success = TaskRepository.deleteTask(id);
    broadcast('tasks:changed');
    return success;
  });

  ipcMain.handle('tasks:toggle-status', async (_, id: string) => {
    const task = TaskRepository.toggleTaskStatus(id);
    broadcast('tasks:changed');
    return task;
  });

  ipcMain.handle('tasks:reschedule', async (_, id: string, newDate: string) => {
    const task = TaskRepository.rescheduleTask(id, newDate);
    broadcast('tasks:changed');
    return task;
  });

  // --- Widget & Wallpaper IPC Handlers ---
  ipcMain.handle('widgets:get', async () => {
    return WallpaperRepository.getActivePreset().widgets;
  });

  ipcMain.handle('widgets:save', async (_, widgets: WidgetConfig[]) => {
    const success = WallpaperRepository.saveWidgets(widgets);
    broadcast('wallpaper:changed');
    return success;
  });

  ipcMain.handle('wallpaper:presets', async () => {
    return WallpaperRepository.getPresets();
  });

  ipcMain.handle('wallpaper:active-preset', async () => {
    return WallpaperRepository.getActivePreset();
  });

  ipcMain.handle('wallpaper:save-preset', async (_, preset: WallpaperPreset) => {
    const success = WallpaperRepository.savePreset(preset);
    broadcast('wallpaper:changed');
    return success;
  });

  // --- Desktop Mode Integration ---
  ipcMain.handle('wallpaper:activate-desktop', async () => {
    const wallWin = getWallpaperWindow();
    if (!wallWin) {
      return { success: false, message: 'Wallpaper window not initialized' };
    }
    const success = await desktopAdapter.activateWallpaperMode(wallWin);
    SettingsRepository.updateSettings({ desktop_mode_active: true });
    broadcast('desktop-mode:changed', true);

    // Automatically dismiss the dashboard/studio window so only the wallpaper exists
    const dashWin = getDashboardWindow();
    if (dashWin && !dashWin.isDestroyed()) {
      dashWin.close();
    }

    return {
      success,
      message: success ? 'Live wallpaper mode activated successfully' : 'Failed to activate live wallpaper mode'
    };
  });

  ipcMain.handle('wallpaper:deactivate-desktop', async () => {
    const wallWin = getWallpaperWindow();
    if (wallWin) {
      await desktopAdapter.deactivateWallpaperMode(wallWin);
    }
    SettingsRepository.updateSettings({ desktop_mode_active: false });
    broadcast('desktop-mode:changed', false);
    // Ensure the Studio window is opened so the user is not left with an empty desktop
    openDashboard();
    return { success: true, message: 'Desktop mode deactivated' };
  });

  ipcMain.handle('wallpaper:capabilities', async () => {
    return desktopAdapter.getCapabilities();
  });

  ipcMain.handle('wallpaper:set-ignore-mouse', async (_, ignore: boolean, forward: boolean = true) => {
    const wallWin = getWallpaperWindow();
    if (wallWin && !wallWin.isDestroyed()) {
      desktopAdapter.setIgnoreMouseEvents(wallWin, ignore, forward);
    }
  });

  ipcMain.handle('wallpaper:open-dashboard', async () => {
    openDashboard();
  });

  ipcMain.handle('app:quit', async () => {
    app.quit();
  });

  // --- Settings & Displays ---
  ipcMain.handle('settings:get', async () => {
    return SettingsRepository.getSettings();
  });

  ipcMain.handle('settings:update', async (_, updates: Partial<AppSettings>) => {
    return SettingsRepository.updateSettings(updates);
  });

  ipcMain.handle('displays:get', async () => {
    return desktopAdapter.getDisplays();
  });
}
