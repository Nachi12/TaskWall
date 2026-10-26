# DayCanvas — Interactive Calendar & Task Desktop Wallpaper

> **DayCanvas** transforms your desktop wallpaper into a beautiful, customizable, interactive calendar and task management workspace for macOS and Windows.

---

## 1. Product Overview

Traditional task managers force you to keep another window open or hide behind tabs. DayCanvas embeds directly into your desktop environment.

### Operating Modes
- **Mode A: Desktop Wallpaper Mode**: Appears as part of the native desktop background behind application windows. Stays stationary across Spaces / virtual desktops, supports dynamic click-through on transparent areas while enabling full interactivity (task checkboxes, inline task additions, calendar navigation) when hovering over widgets.
- **Mode B: Dashboard & Layout Studio**: A dedicated customization window for previewing layouts, dragging and resizing widgets, toggling presets, managing preferences, and activating live wallpaper mode with one click (**Set as Live Wallpaper**).

---

## 2. Core Architecture

```
daycanvas/
├── src/
│   ├── main/                       # Electron Main Process
│   │   ├── index.ts                # Application lifecycle & bootstrap
│   │   ├── application.ts          # Window manager (Wallpaper & Studio windows)
│   │   ├── tray.ts                 # Menu Bar / System Tray integration
│   │   ├── desktop/                # Platform Integration Adapters
│   │   │   ├── desktop-adapter.ts  # Abstract platform contract
│   │   │   ├── macos-adapter.ts    # AppKit window level & spaces integration
│   │   │   └── windows-adapter.ts  # WorkerW / HWND_BOTTOM architecture
│   │   ├── database/               # SQLite database & migrations
│   │   │   ├── db.ts               # Database connection (better-sqlite3 WAL mode)
│   │   │   ├── task-repository.ts  # Task CRUD & carry-forward rollover engine
│   │   │   ├── wallpaper-repository.ts # Preset & widget layout storage
│   │   │   └── settings-repository.ts  # User settings & diagnostics
│   │   └── ipc/                    # Type-safe IPC handlers
│   ├── preload/                    # Secure ContextBridge Preload Script
│   │   └── index.ts                # Exposes window.api
│   ├── renderer/                   # React 18 + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── App.tsx             # Root router (hash-based view switcher)
│   │   │   ├── pages/
│   │   │   │   ├── WallpaperView.tsx   # Desktop wallpaper canvas with dynamic mouse routing
│   │   │   │   ├── Dashboard.tsx       # Primary studio interface
│   │   │   │   ├── WallpaperEditor.tsx # Drag-and-drop widget layout studio
│   │   │   │   └── SettingsView.tsx    # Multi-tab preferences & diagnostics
│   │   │   ├── widgets/
│   │   │   │   ├── ClockWidget.tsx
│   │   │   │   ├── CalendarWidget.tsx
│   │   │   │   ├── TodayTasksWidget.tsx
│   │   │   │   ├── PendingTasksWidget.tsx
│   │   │   │   ├── ProgressWidget.tsx
│   │   │   │   └── WidgetRenderer.tsx
│   │   │   ├── stores/             # Zustand state management
│   │   │   │   ├── useTaskStore.ts
│   │   │   │   └── useWallpaperStore.ts
│   │   │   └── styles/index.css    # Design tokens, glassmorphism, scrollbars
│   └── shared/
│       └── types.ts                # Shared TypeScript types & DayCanvasAPI contract
├── native/                         # Native OS helpers
│   └── macos/                      # AppKit window level Swift binary
├── tests/
│   └── unit/                       # Vitest automated test suite
├── package.json
└── vite.config.ts
```

---

## 3. Key Features

### 📅 Monthly Interactive Calendar
- Full month grid with Monday-first or Sunday-first week layouts.
- Real-time date indicators (total tasks, overdue tasks, completed tasks).
- One-click date selection that instantly updates the connected task view.

### ✅ Automatic Carry-Forward Engine
- At midnight or on wake from sleep, unfinished tasks from past dates are automatically surfaced into today's working set.
- Labeled with clear overdue badges (e.g. `1d overdue`).
- **Non-destructive**: Historical `scheduled_date` values are strictly preserved in SQLite.
- Supports policies: `auto_carry` (default), `manual` rescheduling, or `backlog`.

### ⚡ Inline Quick-Add
- Click `+ Add Task` inside the Today widget.
- Inline input appears; type your task and press Enter.
- Instantly saved to SQLite without opening any dialogs or windows.

### 🎨 Design Presets
1. **Midnight Focus**: Deep navy obsidian (`#0B1020`), violet accents, frosted glass panels (`rgba(20, 26, 45, 0.72)`).
2. **Soft Morning**: Crisp light neutral background with indigo accents.
3. **Minimal Black**: OLED black (`#050505`) with high-contrast typography.

### 🖥️ Native Desktop Integration & Dynamic Click-Through
- **macOS**: AppKit window level `kCGDesktopIconWindowLevel + 1` with collection behaviors `.canJoinAllSpaces`, `.stationary`, `.ignoresCycle`.
- **Dynamic Click-Through**: Background areas forward clicks directly to Finder / desktop icons via `win.setIgnoreMouseEvents(true, { forward: true })`. Hovering over interactive widgets automatically re-enables pointer events (`win.setIgnoreMouseEvents(false)`).
- **Windows**: Dual-mode adapter with `WorkerW` parenting and `HWND_BOTTOM` bottom z-order with safe desktop restore via `SystemParametersInfo`.

---

## 4. Development & Build Commands

### Prerequisites
- Node.js 20.x
- macOS (arm64/x64) or Windows 10/11

### Installation
```bash
cd Daycanvas
npm install
```

### Running in Development
```bash
npm run dev
```

### Running Automated Test Suite
```bash
npm test
```
Runs 8 comprehensive unit and integration tests verifying task rollover, non-destructive dates, calendar aggregations, and layout persistence.

### Building for Production
```bash
npm run build
```
Compiles TypeScript, packages the React renderer via Vite, and bundles the Electron main and preload processes into `dist/` and `dist-electron/`.

### Packaging Native Installers
- **macOS**:
  ```bash
  npm run package:mac
  ```
  Generates `.dmg` and `.zip` distribution bundles in `release/`.
- **Windows**:
  ```bash
  npm run package:win
  ```
  Generates NSIS installer and portable executable in `release/`.

---

## 5. Automated Verification Results

| Test Suite | Scope | Result |
| :--- | :--- | :--- |
| `tests/unit/task-rollover.test.ts` | Non-destructive carry-forward rollover algorithm | ✅ Passed (3/3) |
| `tests/unit/database-features.test.ts` | Calendar summary, rescheduling, preset layouts, settings | ✅ Passed (5/5) |
| `vite build` | React renderer + Electron main/preload bundling | ✅ Passed (0 errors) |
| `Electron runtime` | Dual-window launch (Wallpaper + Dashboard), SQLite WAL | ✅ Verified Active |

---

## 6. License
MIT License.
