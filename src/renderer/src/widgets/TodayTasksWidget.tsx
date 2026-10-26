import React, { useState } from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { Task, TaskPriority } from '@shared/types';
import { Check, Plus, AlertCircle, Trash2, CalendarDays, ArrowRight } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

interface TodayTasksWidgetProps {
  theme?: string;
  config?: {
    allowInlineAdd?: boolean;
    showPriority?: boolean;
  };
}

export const TodayTasksWidget: React.FC<TodayTasksWidgetProps> = ({
  theme = 'midnight',
  config = { allowInlineAdd: true, showPriority: true }
}) => {
  const { tasks, selectedDate, toggleTaskStatus, createTask, deleteTask } = useTaskStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');

  const parsedDate = parseISO(selectedDate);
  const isSelectedToday = isToday(parsedDate);
  const dateHeader = isSelectedToday
    ? `TODAY · ${format(parsedDate, 'EEEE').toUpperCase()}`
    : format(parsedDate, 'EEEE, MMMM d').toUpperCase();

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createTask(newTitle.trim(), newPriority, selectedDate);
    setNewTitle('');
    setIsAdding(false);
  };

  const isLight = theme === 'morning';
  const panelClass = isLight ? 'glass-panel-light text-slate-800' : 'glass-panel text-white';

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/15 border-rose-500/20',
    medium: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
    low: 'text-sky-400 bg-sky-500/15 border-sky-500/20'
  };

  return (
    <div className={`p-5 rounded-2xl ${panelClass} flex flex-col h-full select-none transition-all duration-300 hover:border-canvas-border-focus`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div>
          <h2 className="text-xs font-bold tracking-wider text-canvas-accent flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{dateHeader}</span>
          </h2>
          <p className="text-xs text-canvas-muted mt-0.5">
            {totalCount === 0
              ? 'No tasks scheduled'
              : `${completedCount} of ${totalCount} completed`}
          </p>
        </div>

        {config.allowInlineAdd && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-canvas-accent/20 hover:bg-canvas-accent/30 text-canvas-accent border border-canvas-accent/30 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Inline Quick Add Field */}
      {isAdding && (
        <form onSubmit={handleQuickAdd} className="mb-3 p-2.5 rounded-xl bg-white/5 border border-canvas-accent/40 space-y-2">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Type task title and press Enter..."
            className="w-full bg-transparent text-sm text-white placeholder-canvas-subtle outline-none"
          />
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1">
              {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border transition-all ${
                    newPriority === p
                      ? priorityColors[p]
                      : 'border-transparent text-canvas-subtle hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-0.5 rounded text-canvas-subtle hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-0.5 rounded bg-canvas-accent text-slate-950 font-bold hover:bg-canvas-accent/90"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-canvas-subtle">
            <p className="text-sm">No tasks for this day.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-canvas-accent hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create your first task</span>
            </button>
          </div>
        ) : (
          tasks.map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                onClick={() => toggleTaskStatus(task.id)}
                className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 border cursor-pointer select-none active:scale-[0.99] ${
                  isCompleted
                    ? 'bg-white/[0.02] border-white/5 opacity-60'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-canvas-border-focus'
                }`}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskStatus(task.id);
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    isCompleted
                      ? 'bg-canvas-success text-slate-950 shadow-sm'
                      : 'border border-canvas-subtle/50 hover:border-canvas-accent'
                  }`}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium break-words leading-tight transition-all ${
                        isCompleted ? 'line-through text-canvas-subtle' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Carried Forward Badge */}
                    {task.isCarriedForward && !isCompleted && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <AlertCircle className="w-3 h-3" />
                        <span>Carried forward</span>
                      </span>
                    )}

                    {/* Priority Pill */}
                    {config.showPriority && !isCompleted && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-canvas-subtle hover:text-rose-400 transition-opacity"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
