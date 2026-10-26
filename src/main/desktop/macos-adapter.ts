import { BrowserWindow, screen, app } from 'electron';
import { DesktopAdapter } from './desktop-adapter';
import { DesktopCapabilities, DisplayInfo } from '../../shared/types';
import path from 'path';

export class MacOSDesktopAdapter implements DesktopAdapter {
  isSupported(): boolean {
    return process.platform === 'darwin';
  }

  getCapabilities(): DesktopCapabilities {
    return {
      platform: 'darwin',
      supported: true,
      nativeLevelSupported: true,
      clickThroughSupported: true,
      spacesSupported: true,
      message: 'macOS AppKit native desktop level (-1) & multi-space pinning active'
    };
  }

  async activateWallpaperMode(window: BrowserWindow): Promise<boolean> {
    if (!this.isSupported() || window.isDestroyed()) {
      return false;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y, width, height } = primaryDisplay.bounds;

    // Position window to fill primary monitor exactly
    window.setBounds({ x, y, width, height });

    // Ensure it shows on all macOS Spaces without Mission Control moving it away
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    window.setAlwaysOnTop(false);
    window.setFullScreenable(false);
    window.setSkipTaskbar(true);

    // Apply native AppKit desktop level (-1) and collection behaviors
    try {
      const addonPath = path.join(app.getAppPath(), 'native/macos/desktop_level.node');
      const nativeAddon = require(addonPath);
      nativeAddon.setDesktopLevel(window.getNativeWindowHandle());
    } catch (err) {
      console.warn('Native desktop level helper notice:', err);
    }

    // Hide dock icon in pure wallpaper mode so it behaves strictly as desktop wallpaper
    if (app.dock) {
      app.dock.hide();
    }

    window.showInactive();
    return true;
  }

  async deactivateWallpaperMode(window: BrowserWindow): Promise<boolean> {
    if (window.isDestroyed()) return true;
    window.hide();
    if (app.dock) {
      app.dock.show();
    }
    return true;
  }

  async restoreDesktop(): Promise<boolean> {
    if (app.dock) {
      app.dock.show();
    }
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
