export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type CarryForwardPolicy = 'auto_carry' | 'manual' | 'backlog';

export interface Task {
  id: string;
  title: string;
  description?: string;
  scheduled_date: string; // ISO YYYY-MM-DD
  due_at?: string | null;  // ISO timestamp or null
  priority: TaskPriority;
  status: TaskStatus;
  category_id?: string | null;
  carry_forward_policy: CarryForwardPolicy;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  
  // Computed runtime fields
  isCarriedForward?: boolean;
  overdueDays?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type WidgetType = 'clock' | 'calendar' | 'today_tasks' | 'pending_tasks' | 'progress' | 'timer';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position_x: number; // in pixels or percentage relative to 1440x900 viewport
  position_y: number;
  width: number;
  height: number;
  visible: boolean;
  config: Record<string, any>;
}

export type ThemePreset = 'midnight' | 'morning' | 'minimal' | 'custom';
export type BackgroundType = 'gradient' | 'color' | 'image';

export interface WallpaperPreset {
  id: string;
  name: string;
  background_type: BackgroundType;
  background_value: string;
  theme: ThemePreset;
  widgets: WidgetConfig[];
}

export interface AppSettings {
  start_on_login: boolean;
  launch_in_wallpaper_mode: boolean;
  week_start: 'sunday' | 'monday';
  time_format: '12h' | '24h';
  reduced_motion: boolean;
  carry_forward_policy: CarryForwardPolicy;
  wallpaper_preset_id: string;
  blur_intensity: number; // 0 to 30
  widget_opacity: number; // 0.2 to 1.0
  desktop_mode_active: boolean;
}

export interface DisplayInfo {
  id: number;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  workArea: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  isPrimary: boolean;
}

export interface DesktopCapabilities {
  platform: 'darwin' | 'win32' | 'linux';
  supported: boolean;
  nativeLevelSupported: boolean;
  clickThroughSupported: boolean;
  spacesSupported: boolean;
  message: string;
}

export interface DayCanvasAPI {
  // Task operations
  getTasks: (date?: string) => Promise<Task[]>;
  getPendingTasks: () => Promise<Task[]>;
  getTaskCalendarSummary: (month: string) => Promise<Record<string, { total: number; completed: number; overdue: number }>>;
  createTask: (data: Partial<Task> & { title: string; scheduled_date: string }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<Task>;
  reorderTasks: (orderedIds: string[]) => Promise<boolean>;
  rescheduleTask: (id: string, newDate: string) => Promise<Task>;

  // Widget & Wallpaper operations
  getWidgets: () => Promise<WidgetConfig[]>;
  saveWidgets: (widgets: WidgetConfig[]) => Promise<boolean>;
  getWallpaperPresets: () => Promise<WallpaperPreset[]>;
  getActivePreset: () => Promise<WallpaperPreset>;
  saveActivePreset: (preset: WallpaperPreset) => Promise<boolean>;

  // Desktop Live Wallpaper operations
  activateDesktopMode: () => Promise<{ success: boolean; message: string }>;
  deactivateDesktopMode: () => Promise<{ success: boolean; message: string }>;
  getDesktopCapabilities: () => Promise<DesktopCapabilities>;
  setIgnoreMouseEvents: (ignore: boolean, forward?: boolean) => Promise<void>;
  openDashboardWindow: () => Promise<void>;
  quitApp: () => Promise<void>;

  // Settings & Displays
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  getDisplays: () => Promise<DisplayInfo[]>;

  // Event Listeners
  onTasksChanged: (callback: () => void) => () => void;
  onWallpaperChanged: (callback: () => void) => () => void;
  onDesktopModeChanged: (callback: (active: boolean) => void) => () => void;
}
