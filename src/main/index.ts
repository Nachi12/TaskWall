import { app, BrowserWindow, screen, powerMonitor } from 'electron';
import { initDatabase, closeDatabase } from './database/db';
import { SettingsRepository } from './database/settings-repository';
import { createDesktopAdapter } from './desktop';
import { ApplicationWindowManager } from './application';
import { registerIpcHandlers } from './ipc';
import { createTray, destroyTray } from './tray';

let desktopAdapter = createDesktopAdapter();
let windowManager = new ApplicationWindowManager();
let rolloverCheckInterval: NodeJS.Timeout | null = null;
let lastKnownDate = new Date().toISOString().slice(0, 10);

async function bootstrap() {
  // 1. Initialize SQLite Database & Run Migrations
  initDatabase();

  // 2. Register IPC Handlers
  registerIpcHandlers(
    desktopAdapter,
    () => windowManager.getWallpaperWindow(),
    () => windowManager.getDashboardWindow(),
    (tab) => windowManager.createDashboardWindow(tab)
  );

  // 3. Create Tray / Menu bar
  createTray({
    onOpenDashboard: () => windowManager.createDashboardWindow(),
    onEditWallpaper: () => windowManager.createDashboardWindow('editor'),
    onToggleWallpaperMode: async () => {
      const settings = SettingsRepository.getSettings();
      const wallWin = windowManager.getWallpaperWindow() || windowManager.createWallpaperWindow();
      if (settings.desktop_mode_active) {
        await desktopAdapter.deactivateWallpaperMode(wallWin);
        SettingsRepository.updateSettings({ desktop_mode_active: false });
      } else {
        await desktopAdapter.activateWallpaperMode(wallWin);
        SettingsRepository.updateSettings({ desktop_mode_active: true });
      }
    },
    onRestoreDesktop: async () => {
      const wallWin = windowManager.getWallpaperWindow();
      if (wallWin) {
        await desktopAdapter.deactivateWallpaperMode(wallWin);
      }
      await desktopAdapter.restoreDesktop();
      SettingsRepository.updateSettings({ desktop_mode_active: false });
    },
    onQuit: () => app.quit(),
    isWallpaperActive: () => SettingsRepository.getSettings().desktop_mode_active
  });

  // 4. Exclusively initialize DayCanvas directly into live desktop wallpaper mode
  const wallWin = windowManager.createWallpaperWindow();
  await desktopAdapter.activateWallpaperMode(wallWin);
  SettingsRepository.updateSettings({ desktop_mode_active: true });

  // 5. Setup display change listener
  screen.on('display-metrics-changed', () => {
    const wallWin = windowManager.getWallpaperWindow();
    if (wallWin && !wallWin.isDestroyed()) {
      const primary = screen.getPrimaryDisplay();
      wallWin.setBounds(primary.bounds);
    }
  });

  // 6. Setup rollover check for midnight / resume from sleep
  const checkDayRollover = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== lastKnownDate) {
      lastKnownDate = today;
      // Broadcast tasks changed event so renderer recalculates working set
      const wallWin = windowManager.getWallpaperWindow();
      const dashWin = windowManager.getDashboardWindow();
      if (wallWin && !wallWin.isDestroyed()) wallWin.webContents.send('tasks:changed');
      if (dashWin && !dashWin.isDestroyed()) dashWin.webContents.send('tasks:changed');
    }
  };

  rolloverCheckInterval = setInterval(checkDayRollover, 60000); // Check every minute

  powerMonitor.on('resume', () => {
    checkDayRollover();
  });
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus dashboard if a second instance tries to launch
    const dashWin = windowManager.getDashboardWindow();
    if (dashWin) {
      if (dashWin.isMinimized()) dashWin.restore();
      dashWin.focus();
    } else {
      windowManager.createDashboardWindow();
    }
  });

  app.whenReady().then(bootstrap);

  app.on('window-all-closed', () => {
    // Keep app running in background / tray when all windows close
    if (process.platform === 'darwin') {
      // macOS standard behavior
    }
  });

  app.on('activate', () => {
    if (!windowManager.getDashboardWindow()) {
      windowManager.createDashboardWindow();
    }
  });

  app.on('will-quit', () => {
    if (rolloverCheckInterval) clearInterval(rolloverCheckInterval);
    destroyTray();
    closeDatabase();
  });
}
