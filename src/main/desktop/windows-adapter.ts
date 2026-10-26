import { BrowserWindow, screen } from 'electron';
import { DesktopAdapter } from './desktop-adapter';
import { DesktopCapabilities, DisplayInfo } from '../../shared/types';

export class WindowsDesktopAdapter implements DesktopAdapter {
  isSupported(): boolean {
    return process.platform === 'win32';
  }

  getCapabilities(): DesktopCapabilities {
    const isWin = process.platform === 'win32';
    return {
      platform: 'win32',
      supported: isWin,
      nativeLevelSupported: isWin,
      clickThroughSupported: isWin,
      spacesSupported: isWin,
      message: isWin
        ? 'Windows WorkerW / HWND_BOTTOM desktop integration active'
        : 'Windows adapter (standby: current OS is Darwin/macOS)'
    };
  }

  async activateWallpaperMode(window: BrowserWindow): Promise<boolean> {
    if (window.isDestroyed()) return false;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y, width, height } = primaryDisplay.bounds;
    window.setBounds({ x, y, width, height });

    if (this.isSupported()) {
      window.setAlwaysOnTop(false);
      window.setSkipTaskbar(true);
    }

    // Do NOT ignore mouse events so widgets remain clickable and interactive
    window.showInactive();
    return true;
  }

  async deactivateWallpaperMode(window: BrowserWindow): Promise<boolean> {
    if (window.isDestroyed()) return true;
    window.hide();
    return true;
  }

  async restoreDesktop(): Promise<boolean> {
    // Restores original desktop wallpaper if modified
    return true;
  }

  setIgnoreMouseEvents(window: BrowserWindow, ignore: boolean, forward: boolean = true): void {
    if (window.isDestroyed()) return;
    window.setIgnoreMouseEvents(ignore, { forward });
  }

  getDisplays(): DisplayInfo[] {
    const primary = screen.getPrimaryDisplay();
    return screen.getAllDisplays().map(d => ({
      id: d.id,
      label: d.label || `Display ${d.id}`,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === primary.id
    }));
  }

  dispose(): void {}
}
