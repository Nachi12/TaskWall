import { create } from 'zustand';
import { Task, TaskPriority, DayCanvasAPI } from '@shared/types';
import { format } from 'date-fns';

declare global {
  interface Window {
    api?: DayCanvasAPI;
  }
}

const getTodayISO = () => format(new Date(), 'yyyy-MM-dd');
const getCurrentMonthISO = () => format(new Date(), 'yyyy-MM');

const today = getTodayISO();
const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

const INITIAL_TASKS: Task[] = [
  {
    id: 't-init-1',
    title: 'Review DayCanvas design tokens & wallpaper aesthetics',
    scheduled_date: today,
    priority: 'high',
    status: 'completed',
    carry_forward_policy: 'auto_carry',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    isCarriedForward: false,
    overdueDays: 0
  },
  {
    id: 't-init-2',
    title: 'Set DayCanvas as live desktop wallpaper',
    scheduled_date: today,
    priority: 'high',
    status: 'pending',
    carry_forward_policy: 'auto_carry',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isCarriedForward: false,
    overdueDays: 0
  },
  {
    id: 't-init-3',
    title: 'Explore wallpaper layout studio and themes',
    scheduled_date: today,
    priority: 'medium',
    status: 'pending',
    carry_forward_policy: 'auto_carry',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isCarriedForward: false,
    overdueDays: 0
  },
  {
    id: 't-init-0',
    title: 'Plan weekly productivity goals',
    scheduled_date: yesterday,
    priority: 'high',
    status: 'pending',
    carry_forward_policy: 'auto_carry',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    isCarriedForward: true,
    overdueDays: 1
  }
];

interface TaskState {
  tasks: Task[];
  pendingTasks: Task[];
  calendarSummary: Record<string, { total: number; completed: number; overdue: number }>;
  selectedDate: string;
  currentMonth: string;
  isLoading: boolean;
  
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (month: string) => void;
  fetchTasks: (date?: string) => Promise<void>;
  fetchPendingTasks: () => Promise<void>;
  fetchCalendarSummary: (month?: string) => Promise<void>;
  createTask: (title: string, priority?: TaskPriority, targetDate?: string) => Promise<Task | null>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => Promise<void>;
  initListeners: () => () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: INITIAL_TASKS,
  pendingTasks: [INITIAL_TASKS[3]],
  calendarSummary: {
    [today]: { total: 3, completed: 1, overdue: 0 },
    [yesterday]: { total: 1, completed: 0, overdue: 1 }
  },
  selectedDate: today,
  currentMonth: getCurrentMonthISO(),
  isLoading: false,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().fetchTasks(date);
  },

  setCurrentMonth: (month: string) => {
    set({ currentMonth: month });
    get().fetchCalendarSummary(month);
  },

  fetchTasks: async (date?: string) => {
    const targetDate = date || get().selectedDate;
    set({ isLoading: true });
    try {
      if (window.api?.getTasks) {
        const tasks = await window.api.getTasks(targetDate);
        if (tasks) set({ tasks });
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPendingTasks: async () => {
    try {
      if (window.api?.getPendingTasks) {
        const pendingTasks = await window.api.getPendingTasks();
        if (pendingTasks) set({ pendingTasks });
      }
    } catch (err) {
      console.error('Failed to fetch pending tasks:', err);
    }
  },

  fetchCalendarSummary: async (month?: string) => {
    const targetMonth = month || get().currentMonth;
    try {
      if (window.api?.getTaskCalendarSummary) {
        const calendarSummary = await window.api.getTaskCalendarSummary(targetMonth);
        if (calendarSummary) set({ calendarSummary });
      }
    } catch (err) {
      console.error('Failed to fetch calendar summary:', err);
    }
  },

  createTask: async (title: string, priority: TaskPriority = 'medium', targetDate?: string) => {
    const scheduled_date = targetDate || get().selectedDate;
    if (!title.trim()) return null;

    try {
      if (window.api?.createTask) {
        const task = await window.api.createTask({
          title: title.trim(),
          scheduled_date,
          priority,
          status: 'pending',
          carry_forward_policy: 'auto_carry'
        });
        await get().fetchTasks();
        await get().fetchPendingTasks();
        await get().fetchCalendarSummary();
        return task;
      } else {
        // Fallback for standalone preview
        const newTask: Task = {
          id: `t-${Date.now()}`,
          title: title.trim(),
          scheduled_date,
          priority,
          status: 'pending',
          carry_forward_policy: 'auto_carry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isCarriedForward: false,
          overdueDays: 0
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
    return null;
  },

  toggleTaskStatus: async (id: string) => {
    const prevTasks = get().tasks;
    const prevPending = get().pendingTasks;

    // Instant optimistic UI update
    const target = prevTasks.find(t => t.id === id) || prevPending.find(t => t.id === id);
    if (target) {
      const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
      const nowIso = new Date().toISOString();
      const updatedTasks = prevTasks.map(t =>
        t.id === id
          ? {
              ...t,
              status: nextStatus as Task['status'],
              completed_at: nextStatus === 'completed' ? nowIso : undefined
            }
          : t
      );
      const updatedPending = prevPending.map(t =>
        t.id === id
          ? {
              ...t,
              status: nextStatus as Task['status'],
              completed_at: nextStatus === 'completed' ? nowIso : undefined
            }
          : t
      );
      set({ tasks: updatedTasks, pendingTasks: updatedPending });
    }

    try {
      if (window.api?.toggleTaskStatus) {
        await window.api.toggleTaskStatus(id);
        await get().fetchTasks();
        await get().fetchPendingTasks();
        await get().fetchCalendarSummary();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert on failure
      set({ tasks: prevTasks, pendingTasks: prevPending });
    }
  },

  deleteTask: async (id: string) => {
    try {
      if (window.api?.deleteTask) {
        await window.api.deleteTask(id);
        await get().fetchTasks();
        await get().fetchPendingTasks();
        await get().fetchCalendarSummary();
      } else {
        // Fallback
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  },

  rescheduleTask: async (id: string, newDate: string) => {
    try {
      if (window.api?.rescheduleTask) {
        await window.api.rescheduleTask(id, newDate);
        await get().fetchTasks();
        await get().fetchPendingTasks();
        await get().fetchCalendarSummary();
      }
    } catch (err) {
      console.error('Failed to reschedule task:', err);
    }
  },

  initListeners: () => {
    if (window.api?.onTasksChanged) {
      return window.api.onTasksChanged(() => {
        get().fetchTasks();
        get().fetchPendingTasks();
        get().fetchCalendarSummary();
      });
    }
    return () => {};
  }
}));
