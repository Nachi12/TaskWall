import { app, BrowserWindow, screen } from 'electron';
import path from 'path';

export class ApplicationWindowManager {
  private wallpaperWindow: BrowserWindow | null = null;
  private dashboardWindow: BrowserWindow | null = null;

  getWallpaperWindow(): BrowserWindow | null {
    return this.wallpaperWindow;
  }

  getDashboardWindow(): BrowserWindow | null {
    return this.dashboardWindow;
  }

  createWallpaperWindow(): BrowserWindow {
    if (this.wallpaperWindow && !this.wallpaperWindow.isDestroyed()) {
      return this.wallpaperWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y, width, height } = primaryDisplay.bounds;

    const win = new BrowserWindow({
      x,
      y,
      width,
      height,
      frame: false,
      transparent: true,
      hasShadow: false,
      show: false,
      skipTaskbar: true,
      enableLargerThanScreen: true,
      focusable: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });

    const devUrl = process.env.VITE_DEV_SERVER_URL;
    if (devUrl) {
      win.loadURL(`${devUrl}#wallpaper`);
    } else {
      win.loadFile(path.join(__dirname, '../../dist/index.html'), { hash: 'wallpaper' });
    }

    win.on('closed', () => {
      this.wallpaperWindow = null;
    });

    this.wallpaperWindow = win;
    return win;
  }

  createDashboardWindow(tab?: string): BrowserWindow {
    if (this.dashboardWindow && !this.dashboardWindow.isDestroyed()) {
      this.dashboardWindow.show();
      this.dashboardWindow.focus();
      if (app.dock) app.dock.show();
      if (tab) {
        this.dashboardWindow.webContents.send('navigation:go-to', tab);
      }
      return this.dashboardWindow;
    }

    if (app.dock) app.dock.show();

    const win = new BrowserWindow({
      width: 1280,
      height: 840,
      minWidth: 1024,
      minHeight: 700,
      title: 'DayCanvas Studio',
      backgroundColor: '#0B1020',
      titleBarStyle: 'hiddenInset',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });

    const devUrl = process.env.VITE_DEV_SERVER_URL;
    const hash = tab ? `dashboard/${tab}` : 'dashboard';
    if (devUrl) {
      win.loadURL(`${devUrl}#${hash}`);
    } else {
      win.loadFile(path.join(__dirname, '../../dist/index.html'), { hash });
    }

    win.once('ready-to-show', () => {
      win.show();
      win.focus();
    });

    win.on('closed', () => {
      this.dashboardWindow = null;
      // If wallpaper is running, hide dock icon to act purely as wallpaper
      if (this.wallpaperWindow && !this.wallpaperWindow.isDestroyed() && this.wallpaperWindow.isVisible()) {
        if (app.dock) app.dock.hide();
      }
    });

    this.dashboardWindow = win;
    return win;
  }
}
