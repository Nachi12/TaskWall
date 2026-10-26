import { getDatabase } from './db';
import { Task, CarryForwardPolicy } from '../../shared/types';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export class TaskRepository {
  private static getTodayISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retrieves tasks for a given date, automatically incorporating carried-forward
   * tasks according to the configured policy without mutating historical records.
   */
  static getTasksForDate(targetDate?: string): Task[] {
    const db = getDatabase();
    const today = this.getTodayISO();
    const date = targetDate || today;
    const isTodayQuery = date === today;

    // Fetch tasks directly scheduled for this date
    const directTasks = db.prepare(`
      SELECT * FROM tasks
      WHERE scheduled_date = ?
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at ASC
    `).all(date) as Task[];

    if (!isTodayQuery) {
      return directTasks.map(t => ({
        ...t,
        isCarriedForward: false,
        overdueDays: 0
      }));
    }

    // For today's working set, find incomplete tasks from earlier dates,
    // OR earlier tasks that were completed TODAY as part of today's productivity session!
    const carriedTasksRaw = db.prepare(`
      SELECT * FROM tasks
      WHERE scheduled_date < ? 
        AND (
          status != 'completed' 
          OR (status = 'completed' AND completed_at LIKE ?)
        )
        AND carry_forward_policy != 'backlog'
      ORDER BY 
        CASE status WHEN 'completed' THEN 1 ELSE 0 END ASC,
        scheduled_date ASC, 
        priority DESC
    `).all(today, `${today}%`) as Task[];

    const todayDateObj = parseISO(today);

    const carriedTasks: Task[] = carriedTasksRaw.map(t => {
      const taskScheduledDateObj = parseISO(t.scheduled_date);
      const diff = Math.max(0, differenceInCalendarDays(todayDateObj, taskScheduledDateObj));
      return {
        ...t,
        isCarriedForward: true,
        overdueDays: diff
      };
    });

    // Combine carried tasks with today's direct tasks
    return [...carriedTasks, ...directTasks.map(t => ({ ...t, isCarriedForward: false, overdueDays: 0 }))];
  }

  /**
   * Gets pending & carried-forward tasks across all dates for the Pending Tasks widget
   */
  static getPendingTasks(): Task[] {
    const db = getDatabase();
    const today = this.getTodayISO();
    const todayDateObj = parseISO(today);

    const rows = db.prepare(`
      SELECT * FROM tasks
      WHERE status != 'completed'
      ORDER BY 
        scheduled_date ASC,
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END
    `).all() as Task[];

    return rows.map(t => {
      const taskDateObj = parseISO(t.scheduled_date);
      const isPast = t.scheduled_date < today;
      const diff = isPast ? Math.max(0, differenceInCalendarDays(todayDateObj, taskDateObj)) : 0;
      return {
        ...t,
        isCarriedForward: isPast,
        overdueDays: diff
      };
    });
  }

  /**
   * Summarizes task counts per date for the monthly calendar view
   */
  static getCalendarMonthSummary(yearMonth: string): Record<string, { total: number; completed: number; overdue: number }> {
    const db = getDatabase();
    const today = this.getTodayISO();

    const rows = db.prepare(`
      SELECT 
        scheduled_date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'completed' AND scheduled_date < ? THEN 1 ELSE 0 END) as overdue
      FROM tasks
      WHERE scheduled_date LIKE ?
      GROUP BY scheduled_date
    `).all(today, `${yearMonth}%`) as { scheduled_date: string; total: number; completed: number; overdue: number }[];

    const summary: Record<string, { total: number; completed: number; overdue: number }> = {};
    for (const r of rows) {
      summary[r.scheduled_date] = {
        total: r.total,
        completed: r.completed,
        overdue: r.overdue
      };
    }
    return summary;
  }

  static createTask(data: Partial<Task> & { title: string; scheduled_date: string }): Task {
    const db = getDatabase();
    const id = data.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const priority = data.priority || 'medium';
    const status = data.status || 'pending';
    const carry_forward_policy = data.carry_forward_policy || 'auto_carry';
    const description = data.description || '';
    const scheduled_date = data.scheduled_date;
    const due_at = data.due_at || null;
    const category_id = data.category_id || null;

    db.prepare(`
      INSERT INTO tasks (
        id, title, description, scheduled_date, due_at,
        priority, status, category_id, carry_forward_policy,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.title, description, scheduled_date, due_at,
      priority, status, category_id, carry_forward_policy,
      now, now
    );

    return this.getTaskById(id)!;
  }

  static getTaskById(id: string): Task | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
    if (!row) return null;

    const today = this.getTodayISO();
    const isPast = row.scheduled_date < today && row.status !== 'completed';
    return {
      ...row,
      isCarriedForward: isPast,
      overdueDays: isPast ? differenceInCalendarDays(parseISO(today), parseISO(row.scheduled_date)) : 0
    };
  }

  static updateTask(id: string, updates: Partial<Task>): Task {
    const db = getDatabase();
    const existing = this.getTaskById(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }

    const now = new Date().toISOString();
    const title = updates.title ?? existing.title;
    const description = updates.description ?? existing.description;
    const scheduled_date = updates.scheduled_date ?? existing.scheduled_date;
    const due_at = updates.due_at !== undefined ? updates.due_at : existing.due_at;
    const priority = updates.priority ?? existing.priority;
    const status = updates.status ?? existing.status;
    const category_id = updates.category_id !== undefined ? updates.category_id : existing.category_id;
    const carry_forward_policy = updates.carry_forward_policy ?? existing.carry_forward_policy;
    const completed_at = status === 'completed' && existing.status !== 'completed' 
      ? now 
      : (status !== 'completed' ? null : existing.completed_at);

    db.prepare(`
      UPDATE tasks SET
        title = ?,
        description = ?,
        scheduled_date = ?,
        due_at = ?,
        priority = ?,
        status = ?,
        category_id = ?,
        carry_forward_policy = ?,
        updated_at = ?,
        completed_at = ?
      WHERE id = ?
    `).run(
      title, description, scheduled_date, due_at,
      priority, status, category_id, carry_forward_policy,
      now, completed_at, id
    );

    return this.getTaskById(id)!;
  }

  static toggleTaskStatus(id: string): Task {
    const existing = this.getTaskById(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }

    const nextStatus = existing.status === 'completed' ? 'pending' : 'completed';
    return this.updateTask(id, { status: nextStatus });
  }

  static deleteTask(id: string): boolean {
    const db = getDatabase();
    const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return info.changes > 0;
  }

  static rescheduleTask(id: string, newDate: string): Task {
    return this.updateTask(id, { scheduled_date: newDate });
  }
}
