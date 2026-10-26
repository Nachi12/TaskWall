import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function createTray(callbacks: {
  onOpenDashboard: () => void;
  onEditWallpaper: () => void;
  onToggleWallpaperMode: () => void;
  onRestoreDesktop: () => void;
  onQuit: () => void;
  isWallpaperActive: () => boolean;
}): Tray {
  if (tray) return tray;

  // Create simple 16x16 tray icon image or canvas
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAD5JREFUOE9jZKAQMFKon2H4j08xXhpJNZBwAwk2kFDDyTeQGAMJN5BYA5E3gGwDyTaQcAMJN5BgAwk2EGsYAGtLBRFFNfZ/AAAAAElFTkSuQmCC',
      'base64'
    )
  );

  tray = new Tray(icon);
  tray.setToolTip('DayCanvas — Interactive Desktop Wallpaper');

  const updateContextMenu = () => {
    const active = callbacks.isWallpaperActive();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Dashboard',
        click: callbacks.onOpenDashboard
      },
      {
        label: 'Edit Wallpaper Studio',
        click: callbacks.onEditWallpaper
      },
      { type: 'separator' },
      {
        label: active ? 'Pause Wallpaper Mode' : 'Activate Live Wallpaper',
        click: () => {
          callbacks.onToggleWallpaperMode();
          updateContextMenu();
        }
      },
      {
        label: 'Restore Original Desktop',
        click: callbacks.onRestoreDesktop
      },
      { type: 'separator' },
      {
        label: 'Quit DayCanvas',
        click: callbacks.onQuit
      }
    ]);

    tray?.setContextMenu(contextMenu);
  };

  updateContextMenu();
  tray.on('click', callbacks.onOpenDashboard);

  return tray;
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
