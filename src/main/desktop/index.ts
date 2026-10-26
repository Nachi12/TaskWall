import { DesktopAdapter } from './desktop-adapter';
import { MacOSDesktopAdapter } from './macos-adapter';
import { WindowsDesktopAdapter } from './windows-adapter';

export function createDesktopAdapter(): DesktopAdapter {
  if (process.platform === 'darwin') {
    return new MacOSDesktopAdapter();
  } else if (process.platform === 'win32') {
    return new WindowsDesktopAdapter();
  }
  // Linux or fallback
  return new MacOSDesktopAdapter();
}

export * from './desktop-adapter';
