import { BrowserWindow } from 'electron';
import { DesktopCapabilities, DisplayInfo } from '../../shared/types';

export interface DesktopAdapter {
  isSupported(): boolean;
  getCapabilities(): DesktopCapabilities;
  activateWallpaperMode(window: BrowserWindow): Promise<boolean>;
  deactivateWallpaperMode(window: BrowserWindow): Promise<boolean>;
  restoreDesktop(): Promise<boolean>;
  setIgnoreMouseEvents(window: BrowserWindow, ignore: boolean, forward?: boolean): void;
  getDisplays(): DisplayInfo[];
  dispose(): void;
}
